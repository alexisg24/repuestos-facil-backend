import { Brand } from 'src/brands/entities/brand.entity';
import { Model } from 'src/models/entities/model.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VehicleImages } from './vehicle-images.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

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

  @ManyToOne(() => Model, (model) => model.id, {
    nullable: false,
  })
  @JoinColumn()
  model: Model;

  @ManyToOne(() => Brand, (model) => model.id, {
    nullable: false,
  })
  @JoinColumn()
  brand: Brand;

  @OneToOne(() => VehicleImages, (vehicleImage) => vehicleImage.vehicle, {
    nullable: true,
    cascade: true,
  })
  image?: VehicleImages | null;

  @ManyToMany(() => Product, (product) => product.compatibleVehicles, {
    cascade: false,
    onDelete: 'CASCADE',
    nullable: true,
  })
  compatibleProducts: Product[];

  // Users with this vehicle
  @ManyToMany(() => User, (user) => user.vehicles, {
    cascade: false,
    onDelete: 'CASCADE',
    nullable: true,
  })
  users: User[];
}
