import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { IUser } from 'src/users/user.interface'
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

  async login(user: IUser) {
    const { _id, email, name, role } = user
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      email,
      name,
      role
    }
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      email,
      name,
      role
    }
  }
}
