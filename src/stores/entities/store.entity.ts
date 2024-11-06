import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';
import { StoreImage } from './store-image.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar', { unique: true })
  slug: string;

  @OneToMany(() => Address, (address) => address.store, {
    cascade: true,
    eager: false, // Carga las direcciones al consultar la tienda
  })
  addresses: Address[];

  @Column('varchar', { array: true }) // Almacena múltiples emails como strings separados por comas
  emails: string[] = [];

  @Column('varchar', { array: true }) // Almacena múltiples teléfonos como strings separados por comas
  phones: string[] = [];

  @Column('varchar', { nullable: true })
  logo: string | null;

  @OneToMany(() => StoreImage, (image) => image.store, {
    cascade: true,
  })
  images: StoreImage[];

  @OneToMany(() => Product, (storeProduct) => storeProduct.store, {
    cascade: true,
    eager: false, // No carga los productos al consultar la tienda
  })
  catalog: Product[];
}
