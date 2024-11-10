import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Store } from 'src/stores/entities/store.entity';

@Module({
  controllers: [],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, Vehicle, Store])],
  exports: [UsersService],
})
export class UsersModule {}
