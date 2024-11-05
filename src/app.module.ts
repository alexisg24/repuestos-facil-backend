import { Module } from '@nestjs/common';
import { VehiclesModule } from './vehicles/vehicles.module';
import { BrandsModule } from './brands/brands.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config/envs';
import { Brand } from './brands/entities/brand.entity';
import { ModelsModule } from './models/models.module';
import { Model } from './models/entities/model.entity';
import { Vehicle } from './vehicles/entities/vehicle.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { FilesModule } from './files/files.module';
import { VehicleImages } from './vehicles/entities/vehicle-images.entity';

@Module({
  imports: [
    VehiclesModule,
    BrandsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.DB_HOST,
      port: envs.DB_PORT,
      username: envs.DB_USER,
      password: envs.DB_PASSWORD,
      database: envs.DB_DATABASE,
      entities: [Brand, Model, Vehicle, Category, VehicleImages],
      synchronize: true,
    }),
    ModelsModule,
    CategoriesModule,
    FilesModule,
  ],
})
export class AppModule {}
