import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { RolesService } from './roles.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { ResponseMessage, ReqUser } from 'src/decorators/customize'
import { IUser } from 'src/users/user.interface'

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ResponseMessage('Create a new role')
  create(@Body() createRoleDto: CreateRoleDto, @ReqUser() user: IUser) {
    return this.rolesService.create(createRoleDto, user)
  }

  @Get()
  @ResponseMessage('Fetch Roles with pagination')
  findAll(
    @Query('current') currentPage: string, // const currentPage: string = req.query (query là lấy ra các tham số-params trên url)
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.rolesService.findAll(+currentPage, +limit, qs)
  }

  @Get(':id')
  @ResponseMessage('Get a role by id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id)
  }

  @Patch(':id')
  @ResponseMessage('Update a role')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @ReqUser() user: IUser) {
    return this.rolesService.update(id, updateRoleDto, user)
  }

  @Delete(':id')
  @ResponseMessage('Delete a role by id')
  remove(@Param('id') id: string, @ReqUser() user: IUser) {
    return this.rolesService.remove(id, user)
  }
}
