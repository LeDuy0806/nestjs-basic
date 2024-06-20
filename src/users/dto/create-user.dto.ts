import { Type } from 'class-transformer'
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator'
import mongoose from 'mongoose'

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  name: string
}

// Dành cho admin
export class CreateUserDto {
  @IsNotEmpty()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  age: number

  @IsNotEmpty()
  gender: string

  @IsNotEmpty()
  address: string

  @IsNotEmpty()
  @IsMongoId()
  role: mongoose.Schema.Types.ObjectId

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company
}

// Dành cho user/client
export class RegisterUserDto {
  @IsNotEmpty()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  age: number

  @IsNotEmpty()
  gender: string

  @IsNotEmpty()
  address: string
}
