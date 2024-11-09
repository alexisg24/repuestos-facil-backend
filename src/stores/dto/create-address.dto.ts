import { IsString, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MinLength(3)
  address: string;

  @IsString()
  @MinLength(3)
  title: string;
}
