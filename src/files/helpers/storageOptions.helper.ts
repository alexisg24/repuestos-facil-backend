import { diskStorage } from 'multer';
import { fileNamer } from './fileNamer.helper';
import { fileFilter } from './fileFilter.helper';

export function storageOption({
  folder,
  filesize = 10,
  fileExtension = ['jpg', 'jpeg', 'png'],
}: {
  folder: string;
  filesize?: number;
  fileExtension?: string[];
}) {
  return {
    fileFilter: fileFilter(fileExtension),
    // Default limit 10mb
    limits: { fileSize: 1024 * 1024 * filesize },
    storage: diskStorage({
      destination: `./static/${folder}`,
      filename: fileNamer,
    }),
  };
}
