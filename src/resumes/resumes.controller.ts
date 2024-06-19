import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { ResumesService } from './resumes.service'
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto'
import { UpdateResumeDto } from './dto/update-resume.dto'
import { IUser } from 'src/users/user.interface'
import { ReqUser, ResponseMessage } from 'src/decorators/customize'

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ResponseMessage('Create a new resume')
  create(@Body() createUserCvDto: CreateUserCvDto, @ReqUser() user: IUser) {
    return this.resumesService.create(createUserCvDto, user)
  }

  @Get()
  @ResponseMessage('Fetch Resumes with pagination')
  findAll(
    @Query('current') currentPage: string, // const currentPage: string = req.query (query là lấy ra các tham số-params trên url)
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs)
  }

  @Get(':id')
  @ResponseMessage('Get resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id)
  }

  @Patch(':id')
  @ResponseMessage(`Update resume's status`)
  update(@Param('id') id: string, @ReqUser() user: IUser, @Body('status') status: string) {
    return this.resumesService.update(id, user, status)
  }

  @Delete(':id')
  @ResponseMessage(`Delete a resume by id`)
  remove(@Param('id') id: string, @ReqUser() user: IUser) {
    return this.resumesService.remove(id, user)
  }

  @Post('by-user')
  @ResponseMessage('Get resumes by user')
  getResumeByUser(@ReqUser() user: IUser) {
    return this.resumesService.getResumeByUser(user)
  }
}
