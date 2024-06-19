import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { JobsService } from './jobs.service'
import { CreateJobDto } from './dto/create-job.dto'
import { UpdateJobDto } from './dto/update-job.dto'
import { Public, ResponseMessage, ReqUser } from 'src/decorators/customize'
import { IUser } from 'src/users/user.interface'

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessage('Create a new job')
  create(@Body() createJobDto: CreateJobDto, @ReqUser() user: IUser) {
    return this.jobsService.create(createJobDto, user)
  }

  @Get()
  @Public()
  @ResponseMessage('Fetch Jobs with pagination')
  findAll(
    @Query('current') currentPage: string, // const currentPage: string = req.query (query là lấy ra các tham số-params trên url)
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs)
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Get job by id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id)
  }

  @ResponseMessage('Update a job')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @ReqUser() user: IUser) {
    return this.jobsService.update(id, updateJobDto, user)
  }

  @ResponseMessage('Delete a job')
  @Delete(':id')
  remove(@Param('id') id: string, @ReqUser() user: IUser) {
    return this.jobsService.remove(id, user)
  }
}
