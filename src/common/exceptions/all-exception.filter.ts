import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

interface ValidationError {
  message: string[]
  error: string
  statusCode: number
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    // const request = ctx.getRequest<Request>()
    const status = exception instanceof HttpException ? exception.getStatus() : 500

    const validationErrors = exception instanceof HttpException && (exception.getResponse() as ValidationError)
    if (validationErrors.error === 'Bad Request') {
      return response.status(status).json({
        success: false,
        statusCode: status,
        message: validationErrors.message
      })
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: exception.message
    })
  }
}
