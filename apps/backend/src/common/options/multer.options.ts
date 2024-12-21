import { BadRequestException } from '@nestjs/common';
import * as multer from 'multer';

export const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    callback: (...args: any) => void,
  ) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Invalid file type'), false);
    }
  },
};
