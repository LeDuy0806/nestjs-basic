import { ExecutionContext, SetMetadata, createParamDecorator } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const RESPONSE_MESSAGE = 'response_message'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE, message)

export const ReqUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})

export const IS_PUBLIC_PERMISSION = 'isPublicPermission'
export const SkipCheckPermission = () => SetMetadata(IS_PUBLIC_PERMISSION, true)
