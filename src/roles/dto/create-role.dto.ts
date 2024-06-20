import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator'
import mongoose from 'mongoose'

export class CreateRoleDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  description: string

  @IsNotEmpty()
  isActive: boolean

  @IsNotEmpty()
  @IsMongoId({ each: true })
  @IsArray()
  permissions: mongoose.Schema.Types.ObjectId[]
}
