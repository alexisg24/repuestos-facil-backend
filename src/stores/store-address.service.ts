import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StoresAddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}
  async validateAddressesByIds(ids: string[]): Promise<Address[]> {
    const address = await this.addressRepository.findBy({ id: In(ids) });

    if (address.length !== ids.length) {
      throw new NotFoundException(`One or more addresses not found`);
    }

    return address;
  }
}
