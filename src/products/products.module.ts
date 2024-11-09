import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesModule } from 'src/categories/categories.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { StoresModule } from 'src/stores/stores.module';
import { ElasticSearchModule } from 'src/elastic-search/elastic-search.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    CategoriesModule,
    VehiclesModule,
    StoresModule,
    ElasticSearchModule,
  ],
})
export class ProductsModule {}
