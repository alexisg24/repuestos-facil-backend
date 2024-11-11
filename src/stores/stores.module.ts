import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Address } from './entities/address.entity';
import { StoreImage } from './entities/store-image.entity';
import { Product } from 'src/products/entities/product.entity';
import { StoresAddressService } from './store-address.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StoresController],
  providers: [StoresService, StoresAddressService],
  exports: [StoresService, StoresAddressService],
  imports: [
    TypeOrmModule.forFeature([Store, Address, StoreImage, Product]),
    AuthModule,
  ],
})
export class StoresModule {}
