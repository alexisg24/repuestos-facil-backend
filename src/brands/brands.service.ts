import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationResponse } from 'src/common/util';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  private findQuery(search: string): SelectQueryBuilder<Brand> {
    const queryBuilder = this.brandRepository.createQueryBuilder('brand');
    return queryBuilder.where('LOWER(brand.name) LIKE LOWER(:search)', {
      search: `%${search}%`,
    });
  }

  async create(createBrandDto: CreateBrandDto) {
    const brand = this.brandRepository.create(createBrandDto);
    await this.brandRepository.save(brand);
    return brand;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const currentPage = page;
    const limitPerPage = limit;
    const [brands, totalItems] = await this.findQuery(paginationDto.search)
      .skip((currentPage - 1) * limitPerPage)
      .take(limitPerPage)
      .getManyAndCount();
    const totalPages = Math.ceil(totalItems / limitPerPage);

    return paginationResponse<Brand>({
      data: brands,
      page: currentPage,
      totalPages: totalPages,
      total: totalItems,
    });
  }

  async findOne(id: string) {
    const brand = await this.brandRepository.findOneBy({ id });
    if (!brand) {
      throw new NotFoundException(`Brand with id ${id}, not found`);
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.findOne(id);
    if (brand.name === updateBrandDto.name) {
      return brand;
    }

    const newBrand = await this.brandRepository.save({
      ...brand,
      ...updateBrandDto,
    });

    return newBrand;
  }

  async remove(id: string) {
    const brand = await this.findOne(id);
    await this.brandRepository.remove(brand);

    return brand;
  }
}
