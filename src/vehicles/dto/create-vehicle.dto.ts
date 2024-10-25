import { Type } from 'class-transformer';
import { IsPositive, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsPositive()
  @Type(() => Number)
  year: number;

  @IsPositive()
  @Type(() => Number)
  doors: number;

  @IsString()
  @MinLength(3)
  motor: string;

  @IsString()
  @MinLength(3)
  transmission: string;

  @IsString()
  @MinLength(1)
  fuel: string;

  @IsString()
  @IsUUID()
  modelId: string;

  @IsString()
  @IsUUID()
  brandId: string;
}
