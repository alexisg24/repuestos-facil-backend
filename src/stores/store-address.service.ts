/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationResponse } from 'src/common/util';
import { StoresService } from './stores.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { AuthService } from 'src/auth/auth.service';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class StoresAddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly storesService: StoresService,
    private readonly authService: AuthService,
  ) {}

  async findOne(id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['users'],
      select: { users: { id: true } },
    });
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }

    return address;
  }

  async findManyByStore(storeId: string, paginationDto: PaginationDto) {
    const { limit, page, search } = paginationDto;
    const currentPage = page;
    const limitPerPage = limit;

    const queryBuilder = this.addressRepository.createQueryBuilder('addresses');
    const [addresses, totalItems] = await queryBuilder
      .leftJoin('addresses.store', 'store')
      .where(
        `(LOWER(addresses.address) LIKE LOWER(:search) OR LOWER(addresses.title) LIKE LOWER(:search)) AND addresses.storeId = :storeId`,
        { search: `%${search}%`, storeId },
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
    const store = await this.storesService.findOneAndVerifyUser(storeId);
    const newAddress = this.addressRepository.create({
      ...createAddressDto,
      store,
      users: { id: store.users.id },
    });
    const { store: _, ...address } =
      await this.addressRepository.save(newAddress);
    return address;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.findOneAndVerifyUser(id);
    const { address: newAddress, title } = updateAddressDto;
    address.title = title ?? address.title;
    address.address = newAddress ?? address.address;

    return this.addressRepository.save(address);
  }

  async remove(id: string) {
    const address = await this.findOneAndVerifyUser(id);
    return this.addressRepository.remove(address);
  }

  async validateAddressesByIds(ids: string[]): Promise<Address[]> {
    const address = await this.addressRepository.findBy({ id: In(ids) });
    if (address.length !== ids.length) {
      throw new NotFoundException(`One or more addresses not found`);
    }
    return address;
  }

  async findOneAndVerifyUser(id: string) {
    const address = await this.findOne(id);
    const user = this.authService.getUserFromRequest();
    if (address.users.id !== user.sub) {
      throw new UnauthorizedException();
    }
    return address;
  }
}
