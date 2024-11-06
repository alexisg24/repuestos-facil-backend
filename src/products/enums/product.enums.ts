import { enumToArray } from 'src/common/util';

export enum ProductQualityEnum {
  ORIGINAL = 'ORIGINAL',
  GENERIC = 'GENERIC',
}

export enum ProductTypeEnum {
  NEW = 'NEW',
  USED = 'USED',
  RECONSTRUCTED = 'RECONSTRUCTED',
}

export const ProductQualityEnumArray = enumToArray(ProductQualityEnum);
export const ProductTypeEnumArray = enumToArray(ProductTypeEnum);
