import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsModule } from 'src/brands/brands.module';
import { ModelsModule } from 'src/models/models.module';
import { VehicleImages } from './entities/vehicle-images.entity';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService],
  imports: [
    TypeOrmModule.forFeature([Vehicle, VehicleImages]),
    BrandsModule,
    ModelsModule,
  ],
})
export class VehiclesModule {}
