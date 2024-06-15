import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { LocalAuthGuard } from './auth/local-auth.guard'
import { AuthService } from './auth/auth.service'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { Public } from './decorators/customize'

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authService.login(req.user)
  }

  @Get('me')
  getProfile(@Request() req) {
    return req.user
  }
}
