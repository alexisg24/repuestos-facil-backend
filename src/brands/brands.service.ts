import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}
  async create(createBrandDto: CreateBrandDto) {
    const brand = this.brandRepository.create(createBrandDto);
    await this.brandRepository.save(brand);
    return brand;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const currentPage = page;
    const limitPerPage = limit;
    const totalItems = await this.brandRepository.count();
    const totalPages = Math.ceil(totalItems / limitPerPage);

    const brands = await this.brandRepository.find({
      skip: (currentPage - 1) * limitPerPage,
      take: limitPerPage,
    });
    return {
      data: brands,
      pagination: {
        page: currentPage,
        lastPage: totalPages,
        total: totalItems,
      },
    };
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
