import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { storageOption } from './helpers/storageOptions.helper';
import { Response } from 'express';
import { MultipleFileUpload } from './interfaces';

@Controller('uploads')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('vehicle')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'files', maxCount: 6 }],
      storageOption({ folder: 'vehicle' }),
    ),
  )
  uploadVehicles(
    @UploadedFiles()
    uploadedFiles: MultipleFileUpload,
  ) {
    return this.filesService.uploadMultipleFiles('vehicle', uploadedFiles);
  }

  @Get('/:entity/:filename')
  findOneFile(
    @Res() res: Response,
    @Param('entity') entity: string,
    @Param('filename') filename: string,
  ) {
    if (!entity || !filename) {
      throw new BadRequestException('entity and filename are required');
    }

    const file = this.filesService.getStaticFile(entity, filename);
    res.sendFile(file);
  }
}
