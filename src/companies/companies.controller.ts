import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ResponseMessage, ReqUser } from 'src/decorators/customize'
import { IUser } from 'src/users/user.interface'
import { CompaniesService } from './companies.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ResponseMessage('Company created successfully')
  create(@ReqUser() user: IUser, @Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto, user)
  }

  @Get()
  @ResponseMessage('Company list retrieved successfully')
  findAll(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string) {
    return this.companiesService.findAll(+currentPage, +limit, qs)
  }

  @Get(':id')
  @ResponseMessage('Company retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id)
  }

  @Patch(':id')
  @ResponseMessage('Company updated successfully')
  update(@Param('id') id: string, @ReqUser() user: IUser, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, user, updateCompanyDto)
  }

  @Delete(':id')
  @ResponseMessage('Company deleted successfully')
  remove(@Param('id') id: string, @ReqUser() user: IUser) {
    return this.companiesService.remove(id, user)
  }
}
