import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop()
  name: string

  @Prop()
  age: number

  @Prop()
  phone: string

  @Prop()
  address: string
}

export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.set('versionKey', false)
