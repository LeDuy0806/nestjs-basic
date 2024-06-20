import { BadRequestException, Injectable } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { JwtService } from '@nestjs/jwt'
import { IUser } from 'src/users/user.interface'
import { RegisterUserDto } from 'src/users/dto/create-user.dto'
import { genSaltSync, hashSync } from 'bcryptjs'
import { InjectModel } from '@nestjs/mongoose'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { User as UserModel, UserDocument } from 'src/users/schema/user.schema'
import { ConfigService } from '@nestjs/config'
import ms from 'ms'
import { Response } from 'express'
import { RolesService } from 'src/roles/roles.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private userModel: SoftDeleteModel<UserDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService
  ) {}

  // username và pass là 2 tham số thư viện passport trả về
  // Dùng passport-local sẽ tự động chạy vào hàm này
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username)
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password)
      if (isValid) {
        const userRole = user.role as unknown as { _id: string; name: string }
        const temp = await this.rolesService.findOne(userRole._id)

        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? []
        }

        return objUser
      }
    }
    return null
  }

  // Sau khi validate ng dùng thì sẽ đăng nhập và lấy ra access_token
  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user
    const payload = {
      sub: 'token login', //subject
      iss: 'from server', //issuer <=> generate
      _id,
      name,
      email,
      role
    }

    //refresh_token vs access_token có thông tin như nhau
    const refresh_token = this.createRefreshToken(payload)

    //update user with refresh token at database
    await this.usersService.updateTokenUser(refresh_token, _id)

    //set refresh token into cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true, // chỉ cho server cs thể lấy đc cookies
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES')) //milisecond - ngày cookies biến mất (có thể vẫn hiện nhưng token lại hết hạn)
    })

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        permissions
      }
    }
  }

  getHashPasswordRegister = (password: string) => {
    const salt = genSaltSync(10)
    const hash = hashSync(password, salt)
    return hash
  }

  async register(registerUserDto: RegisterUserDto) {
    //check logic email
    const isEmailExist = await this.userModel.findOne({ email: registerUserDto.email })
    if (isEmailExist) {
      throw new BadRequestException(`Email: '${registerUserDto.email}' already exists`)
    }
    const hashPassword = this.getHashPasswordRegister(registerUserDto.password)
    const userRegisterAfterModify = {
      ...registerUserDto,
      password: hashPassword,
      role: 'USER'
    }
    let user = await this.userModel.create(userRegisterAfterModify)
    return {
      _id: user?._id,
      createdAt: user?.createdAt
    }
  }

  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES')) / 1000
    })

    return refresh_token
  }

  proccessNewToken = async (refreshToken: string, response: Response) => {
    try {
      //giải mã token đã lấy ở cookies -> xem token cs hợp lệ hay kh
      this.jwtService.verify(refreshToken, { secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') })

      //query xuống database tìm user cs refresh token hợp lệ
      let user = await this.usersService.findUserByToken(refreshToken)

      if (user) {
        //update access_token and refresh_token

        const { _id, name, email, role } = user
        const payload = {
          sub: 'token refresh', //subject
          iss: 'from server', //issuer
          _id,
          name,
          email,
          role
        }

        //refresh_token vs access_token có thông tin như nhau
        const refresh_token = this.createRefreshToken(payload)

        //update user with refresh token at database
        await this.usersService.updateTokenUser(refresh_token, _id.toString()) //phải dùng _id.toString() vì _id khi lấy từ DB cs kiểu là ObjectID của Mongoo

        //fetch user role
        const userRole = user.role as unknown as { _id: string; name: string }
        const temp = await this.rolesService.findOne(userRole._id)

        //clear old cookeis - option?
        response.clearCookie('refresh_token')

        //set new refresh token into cookies
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true, // chỉ cho server cs thể lấy đc cookies
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES')) //milisecond - ngày cookies biến mất (có thể token vẫn hiện nhưng nội dung của token lại hết hạn)
        })

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? []
          }
        }
      } else {
        throw new BadRequestException('Refresh Token is invalid. Please Login!')
      }
    } catch (error) {
      throw new BadRequestException('Refresh Token is invalid. Please Login!')
    }
  }

  logout = async (user: IUser, response: Response) => {
    await this.usersService.updateTokenUser('', user._id) // xóa refresh token ở đb
    response.clearCookie('refresh_token') //xóa refresh token ở cookies (browser)
    return 'Ok!'
  }
}
