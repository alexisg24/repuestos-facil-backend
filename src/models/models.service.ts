import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from './entities/model.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationResponse } from 'src/common/util';
import { BrandsService } from 'src/brands/brands.service';
import { Brand } from 'src/brands/entities/brand.entity';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
    private readonly brandsService: BrandsService,
  ) {}

  private findQuery(search: string): SelectQueryBuilder<Model> {
    const queryBuilder = this.modelRepository.createQueryBuilder('models');
    return queryBuilder
      .where(
        `LOWER(brand.name) LIKE LOWER(:search) OR LOWER(models.name) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
      .leftJoinAndSelect('models.brand', 'brand');
  }

  async create(createModelDto: CreateModelDto) {
    const brand = await this.brandsService.findOne(createModelDto.brandId);
    const model = this.modelRepository.create({
      name: createModelDto.name,
      brand,
    });
    await this.modelRepository.save(model);

    return model;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const currentPage = page;
    const limitPerPage = limit;
    const totalItems = await this.findQuery(paginationDto.search).getCount();
    const totalPages = Math.ceil(totalItems / limitPerPage);
    const models = await this.findQuery(paginationDto.search)
      .skip((currentPage - 1) * limitPerPage)
      .take(limitPerPage)
      .getMany();

    return paginationResponse<Model>({
      data: models,
      totalPages: totalPages,
      page: currentPage,
      total: totalItems,
    });
  }

  async findOne(id: string) {
    const model = await this.modelRepository.findOne({
      where: { id },
      relations: ['brand'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${id}, not found`);
    }

    return model;
  }

  async update(id: string, updateModelDto: UpdateModelDto) {
    if (!updateModelDto.name && !updateModelDto.brandId) {
      throw new BadRequestException(
        'You must provide at least one field to update',
      );
    }

    const model = await this.findOne(id);

    if (
      updateModelDto.name === model.name &&
      updateModelDto.brandId === model.brand.id
    ) {
      return model;
    }

    let brand: Brand | undefined = undefined;
    if (updateModelDto.brandId) {
      brand = await this.brandsService.findOne(updateModelDto.brandId);
    }

    const updatedModel = await this.modelRepository.save({
      ...model,
      ...updateModelDto,
      brand: brand || model.brand,
    });

    return updatedModel;
  }

  async remove(id: string) {
    const model = await this.findOne(id);
    await this.modelRepository.remove(model);
    return model;
  }
}
