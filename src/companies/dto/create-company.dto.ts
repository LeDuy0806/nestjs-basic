import { IsEmail, IsNotEmpty } from 'class-validator'

export class CreateCompanyDto {
  // @IsNotEmpty({ message: 'Name must be not empty' })
  name: string

  // @IsNotEmpty({ message: 'Address must be not empty' })
  address: string

  // @IsNotEmpty({
  //   message: 'Description must be not empty'
  // })
  description: string

  // @IsNotEmpty({ message: 'Logo must be not empty' })
  logo: string
}
