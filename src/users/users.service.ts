import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import aqp from 'api-query-params'
import { compareSync, genSaltSync, hashSync } from 'bcryptjs'
import { isEmpty } from 'class-validator'
import mongoose from 'mongoose'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { USER_ROLE } from 'src/databases/sample'
import { Role, RoleDocument } from 'src/roles/schema/role.schema'
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserDocument } from './schema/user.schema'
import { IUser } from './user.interface'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>
  ) {}

  hashPassword(password: string) {
    const salt = genSaltSync(10)
    return hashSync(password, salt)
  }
  getHashPassword = (password: string) => {
    const salt = genSaltSync(10)
    const hash = hashSync(password, salt)
    return hash
  }

  comparePasswords(password: string, hashedPassword: string) {
    return compareSync(password, hashedPassword)
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    //check logic email
    const isEmailExist = await this.userModel.findOne({ email: createUserDto.email })
    if (isEmailExist) {
      throw new BadRequestException(`Email: '${createUserDto.email}' already exists`)
    }

    //fetch user role
    const userRole = await this.roleModel.findOne({ name: USER_ROLE })

    const hashPassword = this.getHashPassword(createUserDto.password)
    const newUser = {
      ...createUserDto,
      password: hashPassword,
      role: userRole?._id
    }

    let userFinal = await this.userModel.create({
      ...newUser,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: userFinal._id,
      createdAt: userFinal.createdAt
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password, address, gender, age } = registerUserDto
    const isExist = await this.userModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email ${email} đã tồn tại`)
    }
    const result = (
      await this.userModel.create({
        name,
        email,
        age,
        gender,
        address,
        password: this.hashPassword(password)
      })
    ).toObject()

    return result
  }

  async fetchUser(currentPage: string, limit: string, qs: string) {
    const { filter, population } = aqp(qs)
    let { sort } = aqp(qs)
    const defaultLimit = +limit ? +limit : 10
    const offset = (+currentPage - 1) * defaultLimit
    delete filter.pageSize
    delete filter.current

    const totalItems = (await this.userModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sort = '-updatedAt'
    }
    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select('-password')
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec()
    return {
      meta: {
        current: +currentPage, //trang hiện tại
        pageSize: defaultLimit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not valid'
    }
    return this.userModel
      .findOne({ _id: id })
      .select('-password')
      .populate({
        path: 'role',
        select: { name: 1, _id: 1 }
      })
  }

  findOneByUsername(username: string) {
    return this.userModel
      .findOne({
        email: username
      })
      .populate({ path: 'role', select: { name: 1 } })
  }
  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword)
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: user._id },
      {
        ...updateUserDto
      }
    )
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found User!'

    const foundUser = await this.userModel.findById(id)
    //hardcode email admin để k thể xóa đc (cs thể sd động = cách dùng file .env)
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException(`Can't delete admin account!`)
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.userModel.softDelete({ _id: id })
  }

  updateTokenUser = async (refreshToken: string, id: string) => {
    return await this.userModel.updateOne({ _id: id }, { refreshToken })
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).populate({
      path: 'role',
      select: { name: 1 }
    })
  }
}
