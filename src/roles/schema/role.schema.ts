import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'
import { Permission } from 'src/permissions/schema/permission.schema'

// Tạo Document -> tham chiếu xuống MongoDB để tạo ra các document
export type RoleDocument = HydratedDocument<Role>

// 1 user => có 1 role và 1 role => có n permissions => 1 user có n permissions khi sử dụng hệ thống
@Schema({ timestamps: true })
export class Role {
  @Prop()
  name: string

  @Prop()
  description: string

  @Prop()
  isActive: boolean

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Permission.name })
  permissions: Permission[]

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date

  @Prop()
  deletedAt: Date

  @Prop()
  isDeleted: boolean

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }
  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }
  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }
}

export const RoleSchema = SchemaFactory.createForClass(Role)
