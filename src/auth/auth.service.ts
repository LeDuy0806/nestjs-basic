import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import ms from 'ms'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { RegisterUserDto } from 'src/users/dto/create-user.dto'
import { User, UserDocument } from 'src/users/schema/user.schema'
import { IUser } from 'src/users/user.interface'
import { UsersService } from 'src/users/users.service'
import { Response } from 'express'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const isValidPassword = this.usersService.comparePasswords(pass, user.password)

    if (!isValidPassword) {
      throw new UnauthorizedException('Wrong password')
    }

    const { password, ...result } = user
    return result
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user
    const payload = {
      sub: 'token login', //subject
      iss: 'from server', //issuer
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
        role
      }
    }
  }

  async register(registerDto: RegisterUserDto) {
    let newUser = await this.usersService.register(registerDto)

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }
  async proccessNewToken(refreshToken: string, response: Response) {
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
          role
        }
      }
    } else {
      throw new BadRequestException('Refresh Token is invalid. Please Login!')
    }
  }

  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES')
    })

    return refresh_token
  }

  logout = async (user: IUser, response: Response) => {
    await this.usersService.updateTokenUser('', user._id) // xóa refresh token ở đb
    response.clearCookie('refresh_token') //xóa refresh token ở cookies (browser)
    return 'Ok!'
  }
}
