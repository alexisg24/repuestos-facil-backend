import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  ProductQualityEnum,
  ProductQualityEnumArray,
  ProductTypeEnum,
  ProductTypeEnumArray,
} from '../enums/product.enums';

export class SearchProductDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductTypeEnumArray, {
    message: `Possible product type values are: ${ProductTypeEnumArray}`,
  })
  productType: ProductTypeEnum;

  @IsOptional()
  @IsEnum(ProductQualityEnumArray, {
    message: `Possible product quality values are: ${ProductQualityEnumArray}`,
  })
  productQuality: ProductQualityEnum;

  @IsOptional()
  @IsString()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  brandId?: string;
}
