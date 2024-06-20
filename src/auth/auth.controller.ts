import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local-auth.guard'
import { Public, ReqUser, ResponseMessage } from 'src/decorators/customize'
import { RegisterUserDto } from 'src/users/dto/create-user.dto'
import { Request as RequestExpress, Response } from 'express'
import { IUser } from 'src/users/user.interface'
import { RolesService } from 'src/roles/roles.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly roleService: RolesService
  ) {}

  @Post('/login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login successfully')
  handleLogin(@Request() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response)
  }

  @Post('/register')
  @Public()
  @ResponseMessage('Register successfully')
  async handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto)
  }

  @ResponseMessage(`Get user's info`)
  @Get('/account')
  async handleGetAccount(@ReqUser() user: IUser) {
    const temp = (await this.roleService.findOne(user.role._id)) as any
    user.permissions = temp.permissions
    return { user }
  }

  @Public()
  @ResponseMessage(`Get user by refresh token`)
  @Get('/refresh')
  handleRefreshToken(@Req() request: RequestExpress, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refresh_token'] //lấy token từ cookies ở browser
    return this.authService.proccessNewToken(refreshToken, response)
  }

  @ResponseMessage(`Logout account`)
  @Post('/logout')
  handleLogout(
    @ReqUser() user: IUser, //cần user để xóa cookies ở đb
    @Res({ passthrough: true }) response: Response //cần response để xóa cookies ở browser
  ) {
    return this.authService.logout(user, response)
  }

  @Get('/me')
  getProfile(@ReqUser() user: IUser) {
    return user
  }
}
