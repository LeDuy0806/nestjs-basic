import { Controller, Get, Request } from '@nestjs/common'
import { AuthService } from './auth/auth.service'

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  // @Post('/login')
  // @Public()
  // @UseGuards(LocalAuthGuard)
  // handleLogin(@Request() req) {
  //   return this.authService.login(req.user)
  // }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
