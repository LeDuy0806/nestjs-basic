import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'
import { Company } from 'src/companies/schema/company.schema'
import { Job } from 'src/jobs/schema/job.schema'

// Tạo Document -> tham chiếu xuống MongoDB để tạo ra các document
export type ResumeDocument = HydratedDocument<Resume>

@Schema({ timestamps: true })
export class Resume {
  @Prop()
  email: string

  @Prop()
  userId: mongoose.Schema.Types.ObjectId

  @Prop()
  url: string

  @Prop()
  status: string

  @Prop()
  salary: number

  // ref: tham chiếu đến Model Company để lấy thông tin dựa vào id (join 2 collection)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name })
  company: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name })
  companyId: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Job.name })
  job: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Job.name })
  jobId: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.Array })
  history: {
    status: string
    updatedAt: Date
    updatedBy: {
      _id: mongoose.Schema.Types.ObjectId
      email: string
    }
  }[]

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

export const ResumeSchema = SchemaFactory.createForClass(Resume)
