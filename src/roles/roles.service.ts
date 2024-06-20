import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { IUser } from 'src/users/user.interface'
import { InjectModel } from '@nestjs/mongoose'
import { RoleDocument, Role as RoleModel } from './schema/role.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import mongoose from 'mongoose'
import aqp from 'api-query-params'

import { ADMIN_ROLE } from 'src/databases/sample'

@Injectable()
export class RolesService {
  constructor(@InjectModel(RoleModel.name) private roleModel: SoftDeleteModel<RoleDocument>) {}

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const nameExists = await this.roleModel.findOne({ name: createRoleDto.name })

    if (nameExists) {
      throw new BadRequestException('This name existed!')
    }

    let newRole = await this.roleModel.create({
      ...createRoleDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newRole._id,
      createdAt: newRole.createdAt
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
    const totalItems = (await this.roleModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.roleModel
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
      throw new BadRequestException('Not Found Role!')
    }
    return (
      (await this.roleModel.findOne({ _id: id }))
        //join vs collection Permission để lấy thêm thông tin
        .populate({
          path: 'permissions',
          select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 }
        })
    ) //1: là chọn, -1: là bỏ chọn
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found Role!'

    return await this.roleModel.updateOne(
      { _id: id },
      {
        ...updateRoleDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not Found Role!'

    const foundRole = await this.roleModel.findById(id)
    //hardcode role admin để k thể xóa đc (cs thể sd động = cách dùng file .env)
    if (foundRole && foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException(`Can't delete ADMIN role!`)
    }

    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.roleModel.softDelete({ _id: id })
  }
}
