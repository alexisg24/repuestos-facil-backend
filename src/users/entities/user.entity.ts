import { Store } from 'src/stores/entities/store.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  lastName: string;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar')
  password: string;

  @Column('varchar', { nullable: true })
  profilePicture: string | null;

  //   User vehicles
  @ManyToMany(() => Vehicle, (vehicle) => vehicle.users, {
    eager: false,
  })
  vehicles: Vehicle[];

  //   User stores
  @OneToMany(() => Store, (store) => store.users, {
    eager: false,
    cascade: true,
  })
  stores: Store[];
}
