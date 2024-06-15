import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { User } from './schemas/user.schema'
import { Model } from 'mongoose'
import { compareSync, genSaltSync, hashSync } from 'bcryptjs'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  hashPassword(password: string) {
    const salt = genSaltSync(10)
    return hashSync(password, salt)
  }

  comparePasswords(password: string, hashedPassword: string) {
    return compareSync(password, hashedPassword)
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = this.hashPassword(createUserDto.password)
      const user = new this.userModel({ ...createUserDto, password: hashedPassword })
      return await user.save()
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }

  findAll() {
    return `This action returns all users`
  }

  async findOne(key: keyof User, value: string): Promise<User> {
    return await this.userModel.findOne({ [key]: value }).lean()
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`
  }

  remove(id: number) {
    return `This action removes a #${id} user`
  }
}
