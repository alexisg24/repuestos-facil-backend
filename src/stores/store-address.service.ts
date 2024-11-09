import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationResponse } from 'src/common/util';
import { StoresService } from './stores.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class StoresAddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly storesService: StoresService,
  ) {}

  async findOne(id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }

    return address;
  }

  async findManyByStore(storeId: string, paginationDto: PaginationDto) {
    const { limit, page, search } = paginationDto;
    console.log(search);

    const currentPage = page;
    const limitPerPage = limit;

    const queryBuilder = this.addressRepository.createQueryBuilder('addresses');
    const [addresses, totalItems] = await queryBuilder
      .where(
        `LOWER(addresses.address) LIKE LOWER(:search) OR LOWER(addresses.title) LIKE LOWER(:search)`,
        { search: `%${search}%` },
      )
      .skip((currentPage - 1) * limitPerPage)
      .take(limitPerPage)
      .getManyAndCount();
    const totalPages = Math.ceil(totalItems / limitPerPage);

    return paginationResponse<Address>({
      data: addresses,
      totalPages: totalPages,
      page: currentPage,
      total: totalItems,
    });
  }

  async assignAddressToStore(
    storeId: string,
    createAddressDto: CreateAddressDto,
  ) {
    const store = await this.storesService.findOne(storeId);
    const newAddress = this.addressRepository.create({
      ...createAddressDto,
      store,
    });
    return this.addressRepository.save(newAddress);
  }

  async remove(id: string) {
    const address = await this.findOne(id);
    return this.addressRepository.remove(address);
  }

  async validateAddressesByIds(ids: string[]): Promise<Address[]> {
    const address = await this.addressRepository.findBy({ id: In(ids) });

    if (address.length !== ids.length) {
      throw new NotFoundException(`One or more addresses not found`);
    }

    return address;
  }
}
