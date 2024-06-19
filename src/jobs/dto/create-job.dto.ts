import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator'
import mongoose from 'mongoose'
class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  logo: string
}

export class CreateJobDto {
  @IsNotEmpty()
  name: string

  @ArrayNotEmpty()
  skills: string[]

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company

  @IsNotEmpty()
  salary: number

  @IsNotEmpty()
  quantity: number

  @IsNotEmpty()
  level: string

  @IsNotEmpty()
  description: string

  @IsNotEmpty()
  startDate: Date

  @IsNotEmpty()
  endDate: Date

  @IsNotEmpty()
  isActive = true

  @IsNotEmpty()
  location: string
}
