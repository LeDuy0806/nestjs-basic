import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { Permission, PermissionDocument } from 'src/permissions/schema/permission.schema'
import { Role, RoleDocument } from 'src/roles/schema/role.schema'
import { User, UserDocument } from 'src/users/schema/user.schema'
import { UsersService } from 'src/users/users.service'
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample'

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name)

  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,

    private configService: ConfigService,

    private userService: UsersService
  ) {}

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT')

    if (Boolean(isInit)) {
      const countUser = await this.userModel.countDocuments({})
      const countPermission = await this.permissionModel.countDocuments({})
      const countRole = await this.roleModel.countDocuments({})

      //create permission
      if (countPermission === 0) {
        await this.permissionModel.insertMany(INIT_PERMISSIONS)
        // inset many <=> bulk create : tạo nhiều phần tử 'cùng 1 lúc'
      }

      //create role
      if (countRole === 0) {
        const permissions = await this.permissionModel.find({}).select('_id') // tìm tất cả permission nhưng chỉ lấy thuộc tính _id

        await this.roleModel.insertMany([
          {
            name: ADMIN_ROLE,
            description: 'Admin thì full quyền',
            isActive: true,
            permissions: permissions
          },

          {
            name: USER_ROLE,
            description: 'Người dùng/Ứng viên sử dụng hệ thống',
            isActive: true,
            permissions: [] // k set quyền, nếu cần thì lấy nick admin để add role cho nick user
          }
        ])
      }

      //create user
      if (countUser === 0) {
        const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE })
        const userRole = await this.roleModel.findOne({ name: USER_ROLE })

        await this.userModel.insertMany([
          {
            name: `I'm Admin`,
            email: 'admin@gmail.com',
            password: this.userService.getHashPassword(this.configService.get<string>('INIT_PASSWORD')),
            age: 21,
            gender: 'MALE',
            address: 'VietNam',
            role: adminRole?._id
          },
          {
            name: `I'm User`,
            email: 'user@gmail.com',
            password: this.userService.getHashPassword(this.configService.get<string>('INIT_PASSWORD')),
            age: 21,
            gender: 'MALE',
            address: 'VietNam',
            role: userRole?._id
          }
        ])
      }

      if (countUser > 0 && countRole > 0 && countPermission > 0) {
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...')
      }
    }
  }
}
