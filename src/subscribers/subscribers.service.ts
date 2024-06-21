import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateSubscriberDto } from './dto/create-subscriber.dto'
import { UpdateSubscriberDto } from './dto/update-subscriber.dto'
import { InjectModel } from '@nestjs/mongoose'
import { SubscriberDocument, Subscriber as SubscriberModel } from './schema/subscriber.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { IUser } from 'src/users/user.interface'
import aqp from 'api-query-params'
import mongoose from 'mongoose'

@Injectable()
export class SubscribersService {
  constructor(@InjectModel(SubscriberModel.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>) {}

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const emailExists = await this.subscriberModel.findOne({ email: createSubscriberDto.email })

    if (emailExists) {
      throw new BadRequestException('This email existed!')
    }

    let newSubscriber = await this.subscriberModel.create({
      ...createSubscriberDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newSubscriber._id,
      createdAt: newSubscriber.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs) //Sử dụng api-query-params
    //Xóa đi thông tin thừa/k cần thiết
    delete filter.current
    delete filter.pageSize

    //Tính toán
    let offset = (+currentPage - 1) * +limit
    let defaultLimit = +limit ? +limit : 10
    const totalItems = (await this.subscriberModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.subscriberModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .select(projection as any)
      .exec()

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã/muốn lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Not Found Subscriber!')
    }
    return await this.subscriberModel.findOne({ _id: id })
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    return await this.subscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      { upsert: true } //upsert -> update or insert
    )
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found Subscriber!'
    await this.subscriberModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.subscriberModel.softDelete({ _id: id })
  }

  async getSkills(user: IUser) {
    const { email } = user
    return await this.subscriberModel.findOne({ email }, { skills: 1 })
  }
}
