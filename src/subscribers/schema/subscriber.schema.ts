import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'

// Tạo Document -> tham chiếu xuống MongoDB để tạo ra các document
export type SubscriberDocument = HydratedDocument<Subscriber>

@Schema({ timestamps: true })
export class Subscriber {
  @Prop()
  name: string

  @Prop({ required: true })
  email: string

  @Prop({ type: mongoose.Schema.Types.Array })
  skills: string[]

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

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber)
