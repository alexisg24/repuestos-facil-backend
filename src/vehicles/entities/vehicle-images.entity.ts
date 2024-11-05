import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity()
export class VehicleImages {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  url: string;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.image, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  vehicle: Vehicle;
}
