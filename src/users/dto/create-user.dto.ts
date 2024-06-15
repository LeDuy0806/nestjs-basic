import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator'

export class CreateUserDto {
  @MinLength(3)
  @MaxLength(20)
  @IsNotEmpty()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  // @MinLength(4)
  // @IsNotEmpty()
  password: string
}
