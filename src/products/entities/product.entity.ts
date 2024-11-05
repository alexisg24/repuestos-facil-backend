import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductQualityEnum, ProductTypeEnum } from '../enums/product.enums';
import { Category } from 'src/categories/entities/category.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { ProductImage } from './product-image.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  slug: string;

  @Column('varchar')
  partNumber: string;

  @Column('varchar')
  description: string;

  @Column('varchar')
  keywords: string[];

  @Column({
    type: 'enum',
    enum: ProductQualityEnum,
    default: ProductQualityEnum.ORIGINAL,
  })
  productQuality: ProductQualityEnum;

  @Column({
    type: 'enum',
    enum: ProductTypeEnum,
    default: ProductTypeEnum.NEW,
  })
  productType: ProductTypeEnum;

  @Column('boolean', { default: false })
  universalCompatibility: boolean;

  @ManyToMany(() => Category, (category) => category.products, {
    cascade: true,
  })
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Vehicle, (vehicle) => vehicle.compatibleProducts, {
    cascade: false,
  })
  @JoinTable()
  compatibleVehicles: Vehicle[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];
}
