import { Injectable } from '@nestjs/common'
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto'
import { UpdateResumeDto } from './dto/update-resume.dto'
import { IUser } from 'src/users/user.interface'
import { InjectModel } from '@nestjs/mongoose'

import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import aqp from 'api-query-params'
import mongoose from 'mongoose'
import { ResumeDocument, Resume as ResumeModel } from './schema/resume.entity'

@Injectable()
export class ResumesService {
  constructor(@InjectModel(ResumeModel.name) private resumeModel: SoftDeleteModel<ResumeDocument>) {}

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    let newCV = await this.resumeModel.create({
      ...createUserCvDto,
      email: user.email,
      userId: user._id,
      status: 'PENDING',
      company: createUserCvDto.companyId,
      job: createUserCvDto.jobId,
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ],
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newCV._id,
      createdAt: newCV.createdAt
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
    const totalItems = (await this.resumeModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.resumeModel
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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found Resume!'

    return this.resumeModel.findOne({ _id: id })
  }

  async update(id: string, user: IUser, status: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found Resume!'

    return await this.resumeModel.updateOne(
      { _id: id },
      {
        $push: {
          history: {
            status: status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        },
        status,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found Resume!'
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.resumeModel.softDelete({ _id: id })
  }

  async getResumeByUser(user: IUser) {
    return await this.resumeModel
      .find({
        userId: user._id
      })
      .sort('-createdAt')
      .populate([
        //populate: để join với collection khác để lấy thêm thông tin
        {
          path: 'companyId', //path: để chỉ ra field (collection) muốn join
          select: { name: 1 }
        },
        {
          path: 'jobId',
          select: { name: 1 }
        }
      ])
  }
}
