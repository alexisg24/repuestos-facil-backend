import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  address: string;

  @Column('varchar')
  title: string;

  @ManyToOne(() => Store, (store) => store.addresses, {
    onDelete: 'CASCADE',
  })
  store: Store;

  @ManyToMany(() => Product, (product) => product.availableIn)
  products: Product[];
}
