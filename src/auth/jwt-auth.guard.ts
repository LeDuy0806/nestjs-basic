import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { IS_PUBLIC_KEY } from 'src/decorators/customize'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (isPublic) {
      return true
    }
    return super.canActivate(context)
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest()
    // You can throw an exception based on either "info" or "err" arguments

    if (err || !user) {
      throw err || new UnauthorizedException(info?.message || 'Invalid token')
    }

    //check permissions
    const targetMethod = request.method
    const targetEndpoint = request.route.path

    const permissions = user?.permissions ?? []
    const isExist = permissions.find(
      (permissions) => targetMethod === permissions.method && targetEndpoint === permissions.apiPath
    )

    if (!isExist) {
      throw new ForbiddenException("You don't have permission to access this endpoint!")
    }
    return user
  }
}
