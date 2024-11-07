import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Store } from './entities/store.entity';
import { Address } from './entities/address.entity';
import { StoreImage } from './entities/store-image.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { generateSlug } from 'src/common/util/generate-slug.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationResponse } from 'src/common/util';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(StoreImage)
    private readonly storeImageRepository: Repository<StoreImage>,
    private readonly dataSource: DataSource,
  ) {}

  private findQuery(search: string): SelectQueryBuilder<Store> {
    const queryBuilder = this.storesRepository.createQueryBuilder('stores');
    return queryBuilder
      .where(
        `LOWER(stores.name) LIKE LOWER(:search) OR LOWER(addresses.title) LIKE LOWER(:search) OR LOWER(addresses.address) LIKE LOWER(:search)`,
        { search: `%${search}%` },
      )
      .leftJoinAndSelect('stores.addresses', 'addresses')
      .leftJoinAndSelect('stores.images', 'images');
  }

  create(createStoreDto: CreateStoreDto) {
    const {
      addresses = [],
      emails = [],
      phones = [],
      images = [],
      logo = null,
      name,
    } = createStoreDto;

    const store = this.storesRepository.create({
      name,
      logo: logo ?? null,
      emails,
      phones,
      addresses: addresses.map((address) => {
        return this.addressRepository.create({
          title: address.title,
          address: address.address,
        });
      }),
      images: images.map((image) => {
        return this.storeImageRepository.create({
          url: image,
        });
      }),
      catalog: [],
      slug: generateSlug(name),
    });

    return this.storesRepository.save(store);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, search } = paginationDto;
    const currentPage = page;
    const limitPerPage = limit;
    const [stores, totalItems] = await this.findQuery(search)
      .skip((currentPage - 1) * limitPerPage)
      .take(limitPerPage)
      .getManyAndCount();
    const totalPages = Math.ceil(totalItems / limitPerPage);
    return paginationResponse<Store>({
      data: stores,
      totalPages: totalPages,
      page: currentPage,
      total: totalItems,
    });
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!store) {
      throw new NotFoundException(`Store with id ${id} not found`);
    }

    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    if (!updateStoreDto) {
      throw new NotFoundException(`No data to update found`);
    }
    const store = await this.findOne(id);
    const {
      images = [],
      emails = [],
      phones = [],
      logo = null,
      name,
    } = updateStoreDto;

    if (name && name !== store.name) store.slug = generateSlug(name);

    store.name = name ?? store.name;
    store.logo = logo ?? store.logo;
    store.emails = emails.length > 0 ? emails : store.emails;
    store.phones = phones.length > 0 ? phones : store.phones;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (images.length > 0) {
        // Delete images
        await queryRunner.manager.delete(StoreImage, {
          store: { id: store.id },
        });
        store.images = images.map((image) => {
          return this.storeImageRepository.create({
            url: image,
          });
        });
      }
      // Save and commit
      await queryRunner.manager.save(store);
      await queryRunner.commitTransaction();
      return store;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const store = await this.findOne(id);
    return this.storesRepository.remove(store);
  }
}
