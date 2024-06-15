import { Injectable } from '@nestjs/common'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Company, CompanyDocument } from './schema/company.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private readonly companyModel: SoftDeleteModel<CompanyDocument>) {}

  create(createCompanyDto: CreateCompanyDto) {
    return 'This action adds a new company'
  }

  findAll() {
    return `This action returns all companies`
  }

  findOne(id: number) {
    return `This action returns a #${id} company`
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`
  }

  remove(id: number) {
    return `This action removes a #${id} company`
  }
}
