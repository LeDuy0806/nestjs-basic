import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { SubscribersService } from './subscribers.service'
import { CreateSubscriberDto } from './dto/create-subscriber.dto'
import { UpdateSubscriberDto } from './dto/update-subscriber.dto'
import { ResponseMessage, SkipCheckPermission, ReqUser } from 'src/decorators/customize'
import { IUser } from 'src/users/user.interface'

@Controller('subscribers')
@SkipCheckPermission()
export class SubscribersController {
  constructor(private readonly SubscriberService: SubscribersService) {}

  @Post()
  @ResponseMessage('Create a new subscriber')
  create(@Body() createRoleDto: CreateSubscriberDto, @ReqUser() user: IUser) {
    return this.SubscriberService.create(createRoleDto, user)
  }

  @Get()
  @ResponseMessage('Fetch Subscriber with pagination')
  findAll(
    @Query('current') currentPage: string, // const currentPage: string = req.query (query là lấy ra các tham số-params trên url)
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.SubscriberService.findAll(+currentPage, +limit, qs)
  }

  @Get(':id')
  @ResponseMessage('Get a subscriber by id')
  findOne(@Param('id') id: string) {
    return this.SubscriberService.findOne(id)
  }

  @Patch()
  @SkipCheckPermission()
  @ResponseMessage('Update a subscriber')
  update(@Body() updateRoleDto: UpdateSubscriberDto, @ReqUser() user: IUser) {
    return this.SubscriberService.update(updateRoleDto, user)
  }

  @Delete(':id')
  @ResponseMessage('Delete a subscriber by id')
  remove(@Param('id') id: string, @ReqUser() user: IUser) {
    return this.SubscriberService.remove(id, user)
  }

  @Post('skills')
  @ResponseMessage('Get subscriber by skills')
  @SkipCheckPermission()
  getUserSkills(@ReqUser() user: IUser) {
    return this.SubscriberService.getSkills(user)
  }
}
