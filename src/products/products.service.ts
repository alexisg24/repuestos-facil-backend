import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { generateSlug } from './utils/generate-slug.util';

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
  ) {}

  async create(createProductDto: CreateProductDto) {
    const {
      images = [],
      categories = [],
      compatibleVehicles = [],
      keywords = [],
      slug,
      ...product
    } = createProductDto;
    const [productCategories, productCompatibleVehicles] = await Promise.all([
      this.categoriesService.validateCategoriesByIds(categories),
      this.vehiclesService.validateVehiclesByIds(compatibleVehicles),
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
    });
    newProduct.categories = productCategories;
    newProduct.compatibleVehicles = productCompatibleVehicles;

    return await this.productRepository.save(newProduct);
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
