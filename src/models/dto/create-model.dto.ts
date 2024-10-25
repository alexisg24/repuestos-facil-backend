import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateModelDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsUUID()
  brandId: string;
}
