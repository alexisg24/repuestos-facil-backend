import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsEmail()
  @MinLength(3)
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(64)
  password: string;
}
