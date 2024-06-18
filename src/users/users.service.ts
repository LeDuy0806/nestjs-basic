import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { compareSync, genSaltSync, hashSync } from 'bcryptjs'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserDocument } from './schema/user.schema'
import { IUser } from './user.interface'
import mongoose from 'mongoose'
import { isEmpty } from 'class-validator'
import aqp from 'api-query-params'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: SoftDeleteModel<UserDocument>) {}

  hashPassword(password: string) {
    const salt = genSaltSync(10)
    return hashSync(password, salt)
  }

  comparePasswords(password: string, hashedPassword: string) {
    return compareSync(password, hashedPassword)
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const newId = new mongoose.Types.ObjectId()
    const newDate = new Date()
    await this.userModel.create({
      ...createUserDto,
      _id: newId,
      email: createUserDto.email,
      password: this.hashPassword(createUserDto.password),
      name: createUserDto.name,
      createdBy: {
        _id: user._id,
        name: user.name
      },
      createdAt: newDate
    })
    return {
      _id: newId,
      createdAt: newDate
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

  async findOneByUsername(username: string) {
    const result = await this.userModel.findOne({ email: username }).lean()
    // .populate({
    //   path: 'role',
    //   select: {
    //     name: 1
    //   }
    // })
    return result
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not valid'
    }
    const foundUser = await this.userModel.findById(id)
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('Không thể xóa tài khoản admin')
    }
    await this.userModel.updateOne({ _id: id }, { deletedBy: { _id: user._id, name: user.name } })
    return await this.userModel.softDelete({ _id: id })
  }

  updateTokenUser = async (refreshToken: string, id: string) => {
    return await this.userModel.updateOne({ _id: id }, { refreshToken })
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken })
  }
}
