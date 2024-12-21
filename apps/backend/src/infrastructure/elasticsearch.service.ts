import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElasticsearchService {
  private readonly client: Client;
  private readonly logger = new Logger(ElasticsearchService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>('ELASTICSEARCH_NODE_URL'),
    });
    this.initIndex();
  }

  async initIndex() {
    const indexExists = await this.client.indices.exists({ index: 'memes' });

    if (!indexExists) {
      await this.createIndex();
    } else {
      this.logger.log('Index already exists');
    }
  }

  async createIndex() {
    try {
      const result = await this.client.indices.create({
        index: 'memes',
        body: {
          mappings: {
            properties: {
              text: { type: 'text' },
              imageUrl: { type: 'text' },
            },
          },
        },
      });

      this.logger.log('Index created successfully:', result);
    } catch (error) {
      this.logger.error('Error creating index:', error);
      throw new Error('Failed to create memes index');
    }
  }

  async indexMeme(text: string, imageUrl: string) {
    try {
      const result = await this.client.index({
        index: 'memes',
        body: {
          text,
          imageUrl,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error indexing meme:', error);
      throw new Error('Failed to index meme');
    }
  }

  async searchMemes(query: string) {
    const { hits } = await this.client.search({
      index: 'memes',
      body: {
        query: {
          match: {
            text: {
              query: query,
              operator: 'and',
              fuzziness: 'AUTO',
            },
          },
        },
      },
    });

    return hits.hits.map((hit: any) => hit._source);
  }

  async bulkIndex(documents: any[]) {
    try {
      const body = documents.flatMap(doc => [{ index: { _index: 'memes' } }, doc]);

      const result = await this.client.bulk({ body });
      if (result.errors) {
        this.logger.error('Bulk indexing failed with errors:', result.items);
        throw new InternalServerErrorException('Failed to bulk index memes');
      }

      this.logger.log('Bulk indexing completed successfully');
      return result;
    } catch (error) {
      this.logger.error('Error with bulk indexing:', error);
      throw new InternalServerErrorException('Failed to bulk index memes');
    }
  }

  async getAllMemes(page: number = 1, pageSize: number = 10) {
    try {
      const from = (page - 1) * pageSize;

      const { hits } = await this.client.search({
        index: 'memes',
        body: {
          query: {
            match_all: {},
          },
          from,
          size: pageSize,
        },
      });

      return {
        memes: hits.hits.map((hit) => hit._source),
        total: hits.total,
      };
    } catch (error) {
      this.logger.error('Error fetching all memes:', error);
      throw new InternalServerErrorException('Failed to fetch memes');
    }
  }
}
