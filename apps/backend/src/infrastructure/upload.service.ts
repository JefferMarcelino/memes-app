import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    this.publicUrl = this.configService.get<string>('PUBLIC_URL', 'http://localhost:3000/uploads');

    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
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
      const filePath = path.join(this.uploadDir, fileName);

      const optimizedBuffer = await sharp(file.buffer)
        .resize(1024)
        .jpeg({ quality: 90 })
        .toBuffer();

      fs.writeFileSync(filePath, optimizedBuffer);

      return `${this.publicUrl}/${fileName}`;
    } catch (error) {
      this.logger.error('Error uploading file', error);
      throw new ServiceUnavailableException('Erro ao fazer upload do arquivo');
    }
  }

  async deleteFile(fileUrl: string) {
    try {
      const fileName = this.extractFileName(fileUrl);
      const filePath = path.join(this.uploadDir, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true, fileName };
      } else {
        throw new NotFoundException(`File not found: ${fileName}`);
      }
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
