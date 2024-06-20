import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'
import { IUser } from 'src/users/user.interface'
import { RolesService } from 'src/roles/roles.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly rolesService: RolesService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')
    })
  }

  async validate(payload: IUser) {
    const { _id, email, name, role } = payload
    const userRole = role as unknown as { _id: string; name: string }
    const temp = (await this.rolesService.findOne(userRole._id)).toObject()
    return {
      _id,
      email,
      name,
      role,
      permissions: temp?.permissions ?? []
    }
  }
}
