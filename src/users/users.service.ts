import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { compareSync, genSaltSync, hashSync } from 'bcryptjs'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserDocument } from './schema/user.schema'

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

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = this.hashPassword(createUserDto.password)
    const user = new this.userModel({ ...createUserDto, password: hashedPassword })
    return await user.save()
  }

  findAll() {
    return `This action returns all users`
  }

  findOne(key: keyof User | '_id', value: string): Promise<User> {
    return this.userModel.findOne({ [key]: value }).lean()
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`
  }

  remove(id: string) {
    const foundUser = this.userModel.findOne({ _id: id })
    if (!foundUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST)
    }

    return this.userModel.softDelete({ _id: id })
  }
}
