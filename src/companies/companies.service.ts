import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Company, CompanyDocument } from './schema/company.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { IUser } from 'src/users/user.interface'
import aqp from 'api-query-params'
import { isEmpty } from 'class-validator'

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private readonly companyModel: SoftDeleteModel<CompanyDocument>) {}

  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    return await this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, population } = aqp(qs)
    let { sort } = aqp(qs)
    const defaultLimit = +limit ? +limit : 10
    const offset = (currentPage - 1) * defaultLimit
    delete filter.page
    delete filter.current
    delete filter.pageSize

    const totalItems = (await this.companyModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sort = '-updatedAt'
    }

    const result = await this.companyModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec()
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: defaultLimit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    const company = await this.companyModel.findById(id)
    if (!company) {
      throw new BadRequestException('Company not found')
    }
    return company
  }

  async update(id: string, user: IUser, updateCompanyDto: UpdateCompanyDto) {
    const updated = await this.companyModel.findByIdAndUpdate(
      id,
      {
        $set: updateCompanyDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      { new: true }
    )
    if (!updated) {
      throw new BadRequestException('Company not found')
    }
    return updated
  }

  async remove(id: string, user: IUser) {
    await this.companyModel.updateOne(
      { _id: id },
      {
        $set: {
          deletedBy: {
            _id: user._id,
            email: user.email
          }
        }
      }
    )
    return await this.companyModel.softDelete({ _id: id })
  }
}
