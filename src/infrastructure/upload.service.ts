import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'CLOUDFLARE_R2_BUCKET',
      'memes',
    );
    this.endpoint = this.configService.get<string>('CLOUDFLARE_R2_ENDPOINT');
    this.publicUrl = this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL');

    const accessKeyId = this.configService.get<string>(
      'CLOUDFLARE_R2_ACCESS_KEY',
    );
    const secretAccessKey = this.configService.get<string>(
      'CLOUDFLARE_R2_SECRET_KEY',
    );

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFiles(files: Express.Multer.File[]) {
    try {
      if (files.length === 0) {
        throw new NotFoundException('Nenhum arquivo foi encontrado');
      }

      const urls = await Promise.all(
        files.map(async (file) => this.uploadFile(file)),
      );

      return urls;
    } catch (error) {
      this.logger.error('Error uploading files', error);
      throw new ServiceUnavailableException(
        'Erro ao fazer upload dos arquivos',
      );
    }
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      const fileExtension = extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;

      const optimizedBuffer = await sharp(file.buffer)
        .resize(1024)
        .jpeg({ quality: 90 })
        .toBuffer();

      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: 'image/jpeg',
      };

      await this.s3Client.send(new PutObjectCommand(params));

      return `${this.publicUrl}/${fileName}`;
    } catch (error) {
      this.logger.error('Error uploading file', error);
      throw new ServiceUnavailableException('Erro ao fazer upload do arquivo');
    }
  }

  async deleteFile(fileUrl: string) {
    try {
      const fileName = this.extractFileName(fileUrl);
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
      };

      await this.s3Client.send(new DeleteObjectCommand(params));
      return { success: true, fileName };
    } catch (error) {
      this.logger.error('Error deleting file', error);
      throw new ServiceUnavailableException('Erro ao deletar o arquivo');
    }
  }

  async deleteFiles(fileUrls: string[]) {
    try {
      const results = await Promise.all(
        fileUrls.map(async (fileUrl) => this.deleteFile(fileUrl)),
      );

      return results;
    } catch (error) {
      this.logger.error('Error deleting files', error);
      throw new ServiceUnavailableException('Erro ao deletar os arquivos');
    }
  }

  private extractFileName(fileUrl: string): string {
    const parts = fileUrl.split('/');
    return parts[parts.length - 1];
  }
}
