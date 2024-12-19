import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MemeImageService } from './meme-image.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { OnlyAdmin } from 'src/common/decorators/only-admin.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/options/multer.options';
import { isPublic } from 'src/common/decorators/is-public.decorator';

@Controller('meme-image')
@UseGuards(AuthGuard)
export class MemeImageController {
  constructor(private memeImageService: MemeImageService) {}

  @Get('/')
  @isPublic()
  async getMemes(@Query('page') page: string, @Query('limit') limit: string) {
    return await this.memeImageService.getAllMemes(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 10,
    );
  }

  @Post('upload')
  @OnlyAdmin()
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  async uploadMemesImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.memeImageService.uploadMemesImages(files);
  }

  @Get('search')
  @isPublic()
  async searchMemes(@Query('query') query: string) {
    return await this.memeImageService.searchMemes(query);
  }
}
