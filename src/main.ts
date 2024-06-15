import { NestApplication, NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { AllExceptionFilter } from './common/exceptions/all-exception.filter'
import { MongoExceptionFilter } from './common/exceptions/mongo-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule)

  app.useGlobalFilters(new MongoExceptionFilter(), new AllExceptionFilter())
  app.useGlobalPipes(new ValidationPipe())

  const reflector = app.get(Reflector)
  // app.useGlobalGuards(new JwtAuthGuard(reflector))

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true
  })
  const configService = app.get(ConfigService)
  const port = configService.get('PORT') || 3000

  await app.listen(port)
}
bootstrap()
