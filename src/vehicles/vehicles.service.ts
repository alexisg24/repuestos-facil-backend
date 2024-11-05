import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationResponse } from 'src/common/util';
import { BrandsService } from 'src/brands/brands.service';
import { ModelsService } from 'src/models/models.service';
import { Brand } from 'src/brands/entities/brand.entity';
import { Model } from 'src/models/entities/model.entity';
import { VehicleImages } from './entities/vehicle-images.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(VehicleImages)
    private readonly imageRepository: Repository<VehicleImages>,
    private readonly brandsService: BrandsService,
    private readonly modelsService: ModelsService,
    private readonly DataSource: DataSource,
  ) {}

  async create(createVehicleDto: CreateVehicleDto) {
    const brand = await this.brandsService.findOne(createVehicleDto.brandId);
    const model = await this.modelsService.findOne(createVehicleDto.modelId);
    // Create query runner
    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      brand,
      model,
      image: createVehicleDto.image
        ? this.imageRepository.create({
            url: createVehicleDto.image,
          })
        : null,
    });

    await this.vehicleRepository.save(vehicle);
    return vehicle;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const currentPage = page;
    const limitPerPage = limit;
    const totalItems = await this.vehicleRepository.count();
    const totalPages = Math.ceil(totalItems / limitPerPage);

    const queryBuilder = this.vehicleRepository.createQueryBuilder('vehicle');

    const vehicles = await queryBuilder
      .where(
        `LOWER(vehicle.name) LIKE LOWER(:search) OR LOWER(brand.name) LIKE LOWER(:search) OR LOWER(model.name) LIKE LOWER(:search)`,
        {
          search: `%${paginationDto.search}%`,
        },
      )
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('vehicle.model', 'model')
      .leftJoinAndSelect('vehicle.image', 'image')
      .take(limit)
      .skip((currentPage - 1) * limit)
      .getMany();

    return paginationResponse({
      data: vehicles,
      page: currentPage,
      totalPages: totalPages,
      total: totalItems,
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['brand', 'model', 'image'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id}, not found`);
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    if (Object.keys(updateVehicleDto).length === 0) {
      throw new BadRequestException(
        'You must provide at least one field to update',
      );
    }

    const vehicle = await this.findOne(id);

    let brand: Brand | undefined = undefined;
    if (updateVehicleDto.brandId) {
      brand = await this.brandsService.findOne(updateVehicleDto.brandId);
    }

    let model: Model | undefined = undefined;
    if (updateVehicleDto.modelId) {
      model = await this.modelsService.findOne(updateVehicleDto.modelId);
    }

    // createQuery Runner
    const queryRunner = this.DataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let image = vehicle.image ?? null;

      // If dto has image
      if (updateVehicleDto.image) {
        // If the vehicle already has an image, delete it
        if (image) {
          await queryRunner.manager.delete(Image, {
            image: { id: image.id },
          });
        }
        // Create the new image
        image = this.imageRepository.create({
          url: updateVehicleDto.image,
        });
        image = await queryRunner.manager.save(image);
      }

      // Update the vehicle object properties
      Object.assign(vehicle, updateVehicleDto);

      // Update the relations
      vehicle.brand = brand || vehicle.brand;
      vehicle.model = model || vehicle.model;
      vehicle.image = image || vehicle.image;

      // Save and commit
      await queryRunner.manager.save(vehicle);
      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const vehicle = await this.findOne(id);
    return this.vehicleRepository.remove(vehicle);
  }
}
