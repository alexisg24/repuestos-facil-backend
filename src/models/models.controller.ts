import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ModelsService } from './models.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  create(@Body() createModelDto: CreateModelDto) {
    return this.modelsService.create(createModelDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.modelsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.modelsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModelDto: UpdateModelDto,
  ) {
    return this.modelsService.update(id, updateModelDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.modelsService.remove(id);
  }
}
