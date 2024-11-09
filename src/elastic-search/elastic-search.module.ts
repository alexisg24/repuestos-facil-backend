import { Module } from '@nestjs/common';
import { ElasticSearchService } from './elastic-search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { envs } from 'src/config/envs';

@Module({
  controllers: [],
  providers: [ElasticSearchService],
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: envs.ELASTIC_SEARCH_URL,
      }),
    }),
  ],
  exports: [ElasticSearchService, ElasticsearchModule],
})
export class ElasticSearchModule {}
