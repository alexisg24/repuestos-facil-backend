import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductQualityEnum, ProductTypeEnum } from '../enums/product.enums';
import { Category } from 'src/categories/entities/category.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { ProductImage } from './product-image.entity';
import { Store } from 'src/stores/entities/store.entity';
import { Address } from 'src/stores/entities/address.entity';

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

  @Column('varchar', { array: true })
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

  @Column('float', { default: 0 })
  price: number;

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
  })
  images?: ProductImage[];

  @ManyToOne(() => Store, (store) => store.catalog, {
    onDelete: 'CASCADE',
  })
  store: Store;

  @ManyToMany(() => Address, (address) => address.products, {
    cascade: false,
  })
  @JoinTable({
    name: 'product_availability',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'address_id', referencedColumnName: 'id' },
  })
  availableIn: Address[];
}
