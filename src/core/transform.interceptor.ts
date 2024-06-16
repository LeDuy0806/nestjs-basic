import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { RESPONSE_MESSAGE } from 'src/decorators/customize'

export interface Response<T> {
  success: boolean
  statusCode: number
  message?: string
  data: any
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {
    // super();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: context.switchToHttp().getResponse().statusCode < 400,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) || 'Server response',
        data: data
      }))
    )
  }
}
