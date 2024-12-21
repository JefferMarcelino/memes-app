import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { UploadService } from './upload.service';
import { ElasticsearchService } from './elasticsearch.service';

@Global()
@Module({
  providers: [DatabaseService, UploadService, ElasticsearchService],
  exports: [DatabaseService, UploadService, ElasticsearchService],
})
export class InfrastructureModule {}
