import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { PermissionsService } from './permissions.service'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { ResponseMessage, ReqUser } from 'src/decorators/customize'
import { IUser } from 'src/users/user.interface'

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ResponseMessage('Create a new permission')
  create(@Body() createPermissionDto: CreatePermissionDto, @ReqUser() user: IUser) {
    return this.permissionsService.create(createPermissionDto, user)
  }

  @Get()
  @ResponseMessage('Fetch Permissions with pagination')
  findAll(
    @Query('current') currentPage: string, // const currentPage: string = req.query (query là lấy ra các tham số-params trên url)
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.permissionsService.findAll(+currentPage, +limit, qs)
  }

  @Get(':id')
  @ResponseMessage('Get a permission by id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id)
  }

  @Patch(':id')
  @ResponseMessage('Update a permission')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @ReqUser() user: IUser) {
    return this.permissionsService.update(id, updatePermissionDto, user)
  }

  @Delete(':id')
  @ResponseMessage('Delete a permission by id')
  remove(@Param('id') id: string, @ReqUser() user: IUser) {
    return this.permissionsService.remove(id, user)
  }
}
