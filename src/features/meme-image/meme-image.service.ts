import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ElasticsearchService } from 'src/infrastructure/elasticsearch.service';
import { UploadService } from 'src/infrastructure/upload.service';
import * as Tesseract from 'tesseract.js';
import * as sharp from 'sharp';

@Injectable()
export class MemeImageService {
  private readonly logger = new Logger(MemeImageService.name);

  constructor(
    private uploadService: UploadService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async uploadMemesImages(files: Express.Multer.File[]) {
    for (const file of files) {
      this.logger.log(`Processing file: ${file.originalname}`);

      try {
        const croppedBuffer = await this.cropCenter(file.buffer);

        const ocrResult = await Tesseract.recognize(croppedBuffer, 'por');
        const extractedText = ocrResult.data.text.trim();

        this.logger.log(`Extracted text: ${extractedText.replace(/\n/g, ' ')}`);

        if (extractedText.length === 0) {
          this.logger.log('No text extracted, skipping upload.');
          continue;
        }

        const similarMemes = await this.searchMemes(extractedText);

        if (similarMemes.length > 0) {
          this.logger.log('Meme already exists, skipping upload.');
          continue;
        }

        const imageUrl = await this.uploadService.uploadFile({
          ...file,
          buffer: croppedBuffer,
        });

        await this.elasticsearchService.indexMeme(extractedText, imageUrl);

        this.logger.log(`Meme indexed successfully: ${imageUrl}`);
      } catch (error) {
        this.logger.error(`Error processing file ${file.originalname}:`, error);
        throw new InternalServerErrorException('Failed to process file');
      }
    }
  }

  async searchMemes(query?: string) {
    try {
      if (!query) {
        return [];
      }

      return await this.elasticsearchService.searchMemes(query);
    } catch (error) {
      this.logger.error('Error searching memes:', error);
      throw new Error('Failed to search memes');
    }
  }

  async getAllMemes(page: number = 1, pageSize: number = 10) {
    try {
      return await this.elasticsearchService.getAllMemes(page, pageSize);
    } catch (error) {
      this.logger.error('Error getting all memes:', error);
      throw new Error('Failed to get all memes');
    }
  }

  private async cropCenter(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      const { width, height } = await image.metadata();

      const cropHeight = Math.floor(height * 0.6);

      const top = Math.floor((height - cropHeight) / 2);

      return image
        .extract({ left: 0, top, width, height: cropHeight })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error cropping image:', error);
      throw new Error('Failed to crop image');
    }
  }
}
