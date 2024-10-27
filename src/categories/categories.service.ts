import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginationResponse } from 'src/common/util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const currentPage = page;
    const limitPerPage = limit;
    const totalItems = await this.categoryRepository.count();
    const totalPages = Math.ceil(totalItems / limitPerPage);
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');
    const categories = await queryBuilder
      .where('LOWER(category.name) LIKE LOWER(:search)', {
        search: `%${paginationDto.search}%`,
      })
      .skip((currentPage - 1) * limitPerPage)
      .take(limitPerPage)
      .getMany();

    return paginationResponse<Category>({
      data: categories,
      page: currentPage,
      totalPages: totalPages,
      total: totalItems,
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id}, not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (!updateCategoryDto.name) {
      throw new BadRequestException(
        'You must provide at least one field to update',
      );
    }
    const category = await this.findOne(id);

    if (category.name === updateCategoryDto.name) {
      return category;
    }

    const updatedCategory = await this.categoryRepository.save({
      ...category,
      ...updateCategoryDto,
    });
    return updatedCategory;
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    return this.categoryRepository.remove(category);
  }
}
