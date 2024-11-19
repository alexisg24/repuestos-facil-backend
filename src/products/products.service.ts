/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, DataSource } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { generateSlug } from '../common/util/generate-slug.util';
import { StoresService } from 'src/stores/stores.service';
import { StoresAddressService } from 'src/stores/store-address.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationResponse } from 'src/common/util';
import { ElasticSearchService } from 'src/elastic-search/elastic-search.service';
import { SearchProductDto } from './dto/search-product.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    private readonly categoriesService: CategoriesService,
    private readonly vehiclesService: VehiclesService,
    private readonly storesService: StoresService,
    private readonly storesAddressService: StoresAddressService,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  async searchProducts(searchProductDto: SearchProductDto) {
    return this.elasticSearchService.searchProducts(searchProductDto);
  }

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
      { users: storeUser, ...store },
      storeAddresses,
    ] = await Promise.all([
      this.categoriesService.validateCategoriesByIds(categories),
      this.vehiclesService.validateVehiclesByIds(compatibleVehicles),
      this.storesService.findOneAndVerifyUser(storeId),
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
      users: { id: storeUser.id },
    });
    newProduct.categories = productCategories;
    newProduct.compatibleVehicles = productCompatibleVehicles;

    const { users: _, ...productResult } =
      await this.productRepository.save(newProduct);
    await this.elasticSearchService.indexProduct(productResult);
    return productResult;
  }

  async findAllByStore(storeId: string, paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const store = await this.storesService.findOne(storeId);

    const currentPage = page;
    const limitPerPage = limit;
    const [products, totalItems] = await this.productRepository.findAndCount({
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
    const totalPages = Math.ceil(totalItems / limitPerPage);

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
        'users',
      ],
      select: {
        users: { id: true },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async findOneBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: [
        'categories',
        'compatibleVehicles',
        'images',
        'availableIn',
        'store',
        'users',
      ],
      select: {
        users: { id: true },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with slug: ${slug} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOneAndVerifyUser(id);

    const {
      images = [],
      categories = [],
      compatibleVehicles = [],
      addressesId = [],
      ...rest
    } = updateProductDto;

    // Validate multiple instances at same time
    const promises = await Promise.all([
      this.categoriesService.validateCategoriesByIds(categories),
      this.vehiclesService.validateVehiclesByIds(compatibleVehicles),
      this.storesAddressService.validateAddressesByIds(addressesId),
    ]);

    const validatedCategories = promises[0];
    const validatedCompatibleVehicles = promises[1];
    const validatedStoreAddresses = promises[2];

    // Query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let productImages = product.images ?? [];

      if (images.length > 0) {
        // Delete product images
        if (productImages?.length > 0) {
          await queryRunner.manager.delete(ProductImage, {
            product: { id: product.id },
          });
        }
        // Set new images
        productImages = images.map((image) =>
          this.imageRepository.create({
            url: image,
          }),
        );
        productImages = await queryRunner.manager.save(productImages);
      }

      // Update product model
      Object.assign(product, { ...rest, images: productImages });

      product.categories =
        categories.length > 0 ? validatedCategories : product.categories;

      product.compatibleVehicles =
        compatibleVehicles.length > 0
          ? validatedCompatibleVehicles
          : product.compatibleVehicles;

      product.availableIn =
        addressesId.length > 0 ? validatedStoreAddresses : product.availableIn;

      // Save changes
      await queryRunner.manager.save(product);

      // Update ElasticSearch
      await this.elasticSearchService.updateProduct(id, product);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return product
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const product = await this.findOneAndVerifyUser(id);
    await this.elasticSearchService.removeProduct(id);
    return this.productRepository.remove(product);
  }

  async findOneAndVerifyUser(id: string) {
    const product = await this.findOne(id);

    const user = this.authService.getUserFromRequest();
    if (product.users.id !== user.sub) {
      throw new UnauthorizedException('This is not your product');
    }
    return product;
  }
}
