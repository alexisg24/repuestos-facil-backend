import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import {
  ProductQualityEnum,
  ProductQualityEnumArray,
  ProductTypeEnum,
  ProductTypeEnumArray,
} from '../enums/product.enums';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @MinLength(3)
  partNumber: string;

  @IsString()
  @IsOptional()
  description?: string = '';

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  keywords: string[];

  @IsEnum(ProductQualityEnumArray, {
    message: `Possible product quality values are: ${ProductQualityEnumArray}`,
  })
  productQuality: ProductQualityEnum;

  @IsEnum(ProductTypeEnumArray, {
    message: `Possible product type values are: ${ProductTypeEnumArray}`,
  })
  productType: ProductTypeEnum;

  @IsBoolean()
  @IsOptional()
  universalCompatibility: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  compatibleVehicles: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  categories: string[];
}
