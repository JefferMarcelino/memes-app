import { Module } from '@nestjs/common';
import { MemeImageController } from './meme-image.controller';
import { MemeImageService } from './meme-image.service';

@Module({
  providers: [MemeImageService],
  controllers: [MemeImageController],
  exports: [MemeImageService],
})
export class MemeImageModule {}
