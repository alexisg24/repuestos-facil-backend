import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import { MultipleFileUpload } from './interfaces';
import { envs } from 'src/config/envs';
@Injectable()
export class FilesService {
  getStaticFile(entity: string, filename: string) {
    const path = join(__dirname, `../../static`, entity, filename);
    if (!existsSync(path))
      throw new BadRequestException(
        `No file found with /${entity}/${filename}`,
      );
    return path;
  }

  uploadMultipleFiles(entity: string, uploadedFiles: MultipleFileUpload) {
    if (!uploadedFiles || !uploadedFiles.files || !uploadedFiles.files.length) {
      throw new BadRequestException('You must upload at least one file');
    }
    const secureUrls = uploadedFiles.files.map((file) => {
      const secureUrl = `${envs.API_HOST_URL}/uploads/${entity}/${file.filename}`;
      return secureUrl;
    });

    return { secureUrls };
  }
}
