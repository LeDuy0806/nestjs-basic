import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateSubscriberDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  skills: string[]
}
