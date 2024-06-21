import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { IS_PUBLIC_KEY, IS_PUBLIC_PERMISSION } from 'src/decorators/customize'

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

    const isSkipPermission = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_PERMISSION, [
      context.getHandler(),
      context.getClass()
    ])

    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException('Token k hợp lệ hoặc k đúng định dạng hoặc k cs token')
    }

    //check permissions
    const targetMethod = request.method
    const targetEndpoint = request.route?.path as string

    const permissions = user?.permissions ?? []
    let isExist = permissions.find(
      (permissions) => targetMethod === permissions.method && targetEndpoint === permissions.apiPath
    )
    if (targetEndpoint.startsWith('/api/v1/auth')) isExist = true

    if (!isExist && !isSkipPermission) {
      throw new ForbiddenException("You don't have permission to access this endpoint(api)!")
    }
    return user
  }
}
