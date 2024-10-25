import { Brand } from 'src/brands/entities/brand.entity';
import { Model } from 'src/models/entities/model.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('int')
  year: number;

  @Column('int')
  doors: number;

  @Column('varchar')
  transmission: string;

  @Column('varchar')
  fuel: string;

  @OneToOne(() => Model, (model) => model.id, {
    nullable: false,
  })
  @JoinColumn()
  model: Model;

  @OneToOne(() => Brand, (model) => model.id, {
    nullable: false,
  })
  @JoinColumn()
  brand: Brand;
}
