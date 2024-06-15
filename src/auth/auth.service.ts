import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne('email', username)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const isValidPassword = this.usersService.comparePasswords(pass, user.password)

    if (!isValidPassword) {
      throw new UnauthorizedException('Wrong password')
    }

    const { password, ...result } = user
    return result
  }
  async login(user: any) {
    const payload = { username: user.email, sub: user._id }
    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
