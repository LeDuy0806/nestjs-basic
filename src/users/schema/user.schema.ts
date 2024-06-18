import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop()
  name: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop()
  age: number

  @Prop()
  gender: string

  @Prop()
  address: string

  @Prop({ type: Object })
  company: {
    _id: mongoose.Schema.Types.ObjectId
    name: string
  }

  @Prop()
  role: string

  @Prop()
  refreshToken: string

  @Prop()
  createdAt: Date

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }

  @Prop()
  updatedAt: Date

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }

  @Prop()
  isDeleted: boolean

  @Prop()
  deletedAt: Date

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }
}
export const UserSchema = SchemaFactory.createForClass(User)
