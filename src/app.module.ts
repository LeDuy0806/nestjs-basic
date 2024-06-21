import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { softDeletePlugin } from 'soft-delete-plugin-mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CompaniesModule } from './companies/companies.module'
import { JobsModule } from './jobs/jobs.module'
import { FilesModule } from './files/files.module'
import { ResumesModule } from './resumes/resumes.module'
import { PermissionsModule } from './permissions/permissions.module'
import { RolesModule } from './roles/roles.module'
import { DatabasesModule } from './databases/databases.module'
import { SubscribersModule } from './subscribers/subscribers.module'
import { MailModule } from './mail/mail.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin)
          return connection
        }
      }),
      inject: [ConfigService]
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    UsersModule,
    AuthModule,
    CompaniesModule,
    JobsModule,
    FilesModule,
    ResumesModule,
    PermissionsModule,
    RolesModule,
    DatabasesModule,
    SubscribersModule,
    MailModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
