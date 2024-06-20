import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'

// Tạo Document -> tham chiếu xuống MongoDB để tạo ra các document
export type PermissionDocument = HydratedDocument<Permission>

// Mỗi Permission (quyền hạn) là 1 api
@Schema({ timestamps: true })
export class Permission {
  @Prop()
  name: string

  @Prop()
  apiPath: string

  @Prop()
  method: string

  //module để gom nhóm các api liên quan đến nhau
  @Prop()
  module: string

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

export const PermissionSchema = SchemaFactory.createForClass(Permission)
