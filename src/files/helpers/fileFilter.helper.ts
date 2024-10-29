/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export const fileFilter =
  (fileExtensions: string[]) =>
  (_: Express.Request, file: Express.Multer.File, callback: Function) => {
    if (!file) return callback(new Error('File is empty'), false);
    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = fileExtensions;
    if (validExtensions.includes(fileExtension)) {
      return callback(null, true);
    }
    return callback(null, false);
  };
