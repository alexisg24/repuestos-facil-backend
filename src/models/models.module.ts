import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model } from './entities/model.entity';
import { BrandsModule } from 'src/brands/brands.module';

@Module({
  controllers: [ModelsController],
  providers: [ModelsService],
  imports: [TypeOrmModule.forFeature([Model]), BrandsModule],
})
export class ModelsModule {}
