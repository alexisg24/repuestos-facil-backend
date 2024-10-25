import { Brand } from 'src/brands/entities/brand.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  name: string;

  @OneToOne(() => Brand, (brand) => brand.id, {
    nullable: false,
  })
  @JoinColumn()
  brand: Brand;
}
