import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity()
export class StoreImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  url: string;

  @ManyToOne(() => Store, (store) => store.images, {
    onDelete: 'CASCADE',
  })
  store: Store;
}
