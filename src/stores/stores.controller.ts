import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StoresAddressService } from './store-address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('stores')
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
    private readonly storesAddressService: StoresAddressService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.storesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.remove(id);
  }

  @Get(':id/addresses')
  findManyByStore(
    @Param('id', ParseUUIDPipe) storeId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.storesAddressService.findManyByStore(storeId, paginationDto);
  }

  @UseGuards(AuthGuard)
  @Post(':id/addresses')
  assignAddressToStore(
    @Param('id', ParseUUIDPipe) storeId: string,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.storesAddressService.assignAddressToStore(
      storeId,
      createAddressDto,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('addresses/:addressId')
  removeAddress(@Param('addressId', ParseUUIDPipe) addressId: string) {
    return this.storesAddressService.remove(addressId);
  }

  @UseGuards(AuthGuard)
  @Patch('addresses/:addressId')
  updateAddress(
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.storesAddressService.update(addressId, updateAddressDto);
  }
}
