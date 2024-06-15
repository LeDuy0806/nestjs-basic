import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'

export type CompanyDocument = HydratedDocument<Company>

@Schema({ timestamps: true, versionKey: false })
export class Company {
  @Prop()
  name: string

  @Prop()
  logo: string

  @Prop()
  address: string

  @Prop()
  description: string

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

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date

  @Prop()
  phone: string

  @Prop()
  isDeleted: boolean

  @Prop()
  deletedAt: Date
}
export const CompanySchema = SchemaFactory.createForClass(Company)
