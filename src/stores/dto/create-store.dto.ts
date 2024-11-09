import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from './create-address.dto';

export class CreateStoreDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsArray()
  @ValidateNested({
    each: true,
    message: ` must be an object containing title and address`,
  })
  @ArrayMinSize(1)
  @Type(() => CreateAddressDto)
  addresses: CreateAddressDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  emails: string[] = [];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  phones: string[] = [];

  @IsString()
  @IsOptional()
  logo: string | null;

  @IsArray()
  @IsString({ each: true })
  images: string[];
}
