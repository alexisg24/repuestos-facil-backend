import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { generateSlug } from '../common/util/generate-slug.util';
import { StoresService } from 'src/stores/stores.service';
import { StoresAddressService } from 'src/stores/store-address.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationResponse } from 'src/common/util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    private readonly categoriesService: CategoriesService,
    private readonly vehiclesService: VehiclesService,
    private readonly DataSource: DataSource,
    private readonly storesService: StoresService,
    private readonly storesAddressService: StoresAddressService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const {
      images = [],
      categories = [],
      compatibleVehicles = [],
      keywords = [],
      slug,
      storeId,
      addressesId = [],
      ...product
    } = createProductDto;

    // Get Store, categories, vehicles and addresses with automatic validation
    const [
      productCategories,
      productCompatibleVehicles,
      store,
      storeAddresses,
    ] = await Promise.all([
      this.categoriesService.validateCategoriesByIds(categories),
      this.vehiclesService.validateVehiclesByIds(compatibleVehicles),
      this.storesService.findOne(storeId),
      this.storesAddressService.validateAddressesByIds(addressesId),
    ]);

    const newProduct = this.productRepository.create({
      ...product,
      keywords: keywords.map((keyword) => keyword.trim()) ?? [],
      images: images.map((image) =>
        this.imageRepository.create({
          url: image,
        }),
      ),
      slug: generateSlug(slug ?? product.name),
      store,
      availableIn: storeAddresses,
    });
    newProduct.categories = productCategories;
    newProduct.compatibleVehicles = productCompatibleVehicles;

    return await this.productRepository.save(newProduct);
  }

  async findAllByStore(storeId: string, paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    console.log(paginationDto);

    const store = await this.storesService.findOne(storeId);

    const currentPage = page;
    const limitPerPage = limit;
    const totalItems = await this.productRepository.count({ where: { store } });
    const totalPages = Math.ceil(totalItems / limitPerPage);

    const products = await this.productRepository.find({
      where: { store },
      relations: [
        'categories',
        'compatibleVehicles',
        'images',
        'availableIn',
        'store',
      ],
      skip: (currentPage - 1) * limitPerPage,
      take: limitPerPage,
    });

    return paginationResponse<Product>({
      data: products,
      totalPages: totalPages,
      page: currentPage,
      total: totalItems,
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'categories',
        'compatibleVehicles',
        'images',
        'availableIn',
        'store',
      ],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    console.log(updateProductDto);
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
