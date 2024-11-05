import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  name: string;

  @ManyToMany(() => Product, (product) => product.categories, {
    cascade: false,
    onDelete: 'CASCADE',
    nullable: true,
  })
  products: Product[];
}
