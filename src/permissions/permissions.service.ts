import { BadRequestException, Injectable } from '@nestjs/common'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { InjectModel } from '@nestjs/mongoose'
import { PermissionDocument, Permission as PermissionModel } from './schema/permission.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { IUser } from 'src/users/user.interface'
import mongoose from 'mongoose'
import aqp from 'api-query-params'

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(PermissionModel.name) private permissionModel: SoftDeleteModel<PermissionDocument>) {}

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const apiPathExists = await this.permissionModel.findOne({ apiPath: createPermissionDto.apiPath })
    const methodExists = await this.permissionModel.findOne({ method: createPermissionDto.method })
    if (apiPathExists && methodExists) {
      throw new BadRequestException('This apiPath & method existed!')
    }

    let newPermission = await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newPermission._id,
      createdAt: newPermission.createdAt
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
    const totalItems = (await this.permissionModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.permissionModel
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
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found Permission!'
    return this.permissionModel.findOne({ _id: id })
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found Permission!'

    return await this.permissionModel.updateOne(
      { _id: id },
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found Permission!'
    await this.permissionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.permissionModel.softDelete({ _id: id })
  }
}
