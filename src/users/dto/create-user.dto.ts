import { Type } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator'
import mongoose from 'mongoose'

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  name: string
}
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
  address: string

  @IsNotEmpty()
  gender: string

  // @IsNotEmpty()
  // role: string
}
export class CreateUserDto {
  @IsNotEmpty()
  name: string

  @IsEmail({})
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  age: number

  @IsNotEmpty()
  address: string

  @IsNotEmpty()
  gender: string

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company
}
