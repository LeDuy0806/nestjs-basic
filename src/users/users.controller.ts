import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ResponseMessage, ReqUser, Public } from 'src/decorators/customize'
import { IUser } from './user.interface'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('User created successfully')
  async create(@Body() createUserDto: CreateUserDto, @ReqUser() user: IUser) {
    return await this.usersService.create(createUserDto, user)
  }

  @Get()
  @ResponseMessage('Fetch user with paginate')
  findAll(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string) {
    return this.usersService.fetchUser(currentPage, limit, qs)
  }

  @Get(':id')
  @Public()
  @ResponseMessage('User retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Patch()
  @ResponseMessage('Update user successfully')
  update(@Body() updateUserDto: UpdateUserDto, @ReqUser() user: IUser) {
    return this.usersService.update(updateUserDto, user)
  }

  @Delete(':id')
  @ResponseMessage('Delete a User')
  remove(@Param('id') id: string, @ReqUser() user: IUser) {
    return this.usersService.remove(id, user)
  }
}
