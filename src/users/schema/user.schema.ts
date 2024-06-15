import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({
  timestamps: true,
  versionKey: false
})
export class User {
  @Prop({ unique: true, required: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop()
  name: string

  @Prop({
    default: 0
  })
  age: number

  @Prop({
    default: null
  })
  phone: string

  @Prop({
    default: null
  })
  address: string

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date

  @Prop()
  isDeleted: boolean

  @Prop()
  deletedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
