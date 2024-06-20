import { Module } from '@nestjs/common'
import { DatabasesService } from './databases.service'
import { DatabasesController } from './databases.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/users/schema/user.schema'
import { Permission, PermissionSchema } from 'src/permissions/schema/permission.schema'
import { Role, RoleSchema } from 'src/roles/schema/role.schema'
import { UsersService } from 'src/users/users.service'

@Module({
  controllers: [DatabasesController],
  providers: [DatabasesService, UsersService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema }
    ])
  ]
})
export class DatabasesModule {}
