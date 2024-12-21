import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ElasticsearchService } from 'src/infrastructure/elasticsearch.service';
import { UploadService } from 'src/infrastructure/upload.service';
import * as Tesseract from 'tesseract.js';
import * as sharp from 'sharp';
import * as pLimit from 'p-limit';

@Injectable()
export class MemeImageService {
  private readonly logger = new Logger(MemeImageService.name);

  constructor(
    private uploadService: UploadService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async uploadMemesImages(files: Express.Multer.File[]) {
    const batch: any[] = [];
    const failedUploads: { imageUrl: string }[] = [];

    const limit = pLimit(5);
  
    const processPromises = files.map(async (file) => {
      return limit(async () => {
        this.logger.log(`Processing file: ${file.originalname}`);
    
        try {
          const croppedBuffer = await this.cropCenter(file.buffer);
    
          const ocrResult = await Tesseract.recognize(croppedBuffer, 'por');
          const extractedText = ocrResult.data.text.trim();
    
          this.logger.log(`Extracted text: ${extractedText.replace(/\n/g, ' ')}`);
    
          if (extractedText.length === 0) {
            this.logger.log('No text extracted, skipping upload.');
            return;
          }

          const similiarMemes = await this.elasticsearchService.searchMemes(extractedText.replace(/\n/g, ' '));

          if (similiarMemes.length > 0) {
            this.logger.log('This meme was already indexed');
            return;
          }
    
          const imageUrl = await this.uploadService.uploadFile({
            ...file,
            buffer: croppedBuffer,
          });
    
          batch.push({
            text: extractedText,
            imageUrl,
          });
    
          this.logger.log(`Meme prepared for batch indexing: ${imageUrl}`);
        } catch (error) {
          this.logger.error(`Error processing file ${file.originalname}:`, error);
    
          if (file) {
            failedUploads.push({ imageUrl: file.originalname });
          }
        }
      });  
    });
  
    await Promise.all(processPromises);
  
    if (batch.length > 0) {
      console.log(batch)
      await this.elasticsearchService.bulkIndex(batch);
    }
  
    await this.uploadService.deleteFiles(failedUploads.map((failedUpload) => failedUpload.imageUrl));
  
    this.logger.log('All memes indexed successfully');
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
