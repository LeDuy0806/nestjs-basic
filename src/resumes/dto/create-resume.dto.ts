import { IsMongoId, IsNotEmpty } from 'class-validator'
import mongoose from 'mongoose'

export class CreateResumeDto {
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  userId: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  url: string

  @IsNotEmpty()
  status: string

  @IsNotEmpty()
  company: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  job: mongoose.Schema.Types.ObjectId
}

//upload cv
export class CreateUserCvDto {
  @IsNotEmpty()
  url: string

  @IsNotEmpty()
  @IsMongoId()
  companyId: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  @IsMongoId()
  jobId: mongoose.Schema.Types.ObjectId
}
