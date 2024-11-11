import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

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

  // User
  @ManyToOne(() => User, (user) => user.addresses, {
    onDelete: 'CASCADE',
  })
  users: User;
}
