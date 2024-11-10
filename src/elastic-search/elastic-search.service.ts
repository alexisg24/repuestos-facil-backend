import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { paginationResponse } from 'src/common/util';
import { Product } from 'src/products/entities/product.entity';
import { searchProductsQueryBuilder } from './helpers/search-products-query-builder.helper';
import { SearchProductDto } from 'src/products/dto/search-product.dto';

@Injectable()
export class ElasticSearchService {
  private readonly esIndex = 'products';
  constructor(private readonly elasticSearchService: ElasticsearchService) {}

  async indexProduct(product: Product) {
    await this.elasticSearchService.index({
      index: this.esIndex,
      id: product.id,
      body: {
        ...product,
        images: product.images?.map((image) => image.url) ?? [],
      },
    });
  }

  async updateProduct(id: string, partialProduct: Partial<Product>) {
    await this.elasticSearchService.update({
      index: this.esIndex,
      id,
      body: {
        doc: partialProduct,
      },
    });
  }

  async searchProducts(searchProductDto: SearchProductDto) {
    const query = searchProductsQueryBuilder(searchProductDto);

    const { hits } = await this.elasticSearchService.search<Product>({
      index: this.esIndex,
      body: {
        size: searchProductDto.limit,
        from: (searchProductDto.page - 1) * searchProductDto.limit,
        sort: [
          { productType: { order: 'asc' } },
          { productQuality: { order: 'desc' } },
          { _score: { order: 'desc' } },
          { createdAt: { order: 'desc' } },
        ],
        query,
      },
    });

    const products = hits.hits.map((hit) => hit._source);
    const totalItems = Number((hits.total as { value: number })?.value) ?? 0;
    const totalPages = Math.ceil(totalItems / searchProductDto.limit);
    const currentPage = searchProductDto.page;

    return paginationResponse({
      data: products,
      totalPages: totalPages,
      page: currentPage,
      total: totalItems,
    });
  }

  async removeProduct(id: string) {
    await this.elasticSearchService.delete({
      index: this.esIndex,
      id,
    });
  }

  async onModuleinit() {
    await this.createIndex();
  }

  async createIndex() {
    const indexExists = await this.elasticSearchService.indices.exists({
      index: 'products',
    });

    if (!indexExists) {
      // Si no existe, creamos el índice
      await this.elasticSearchService.indices.create({
        index: 'products',
        body: {
          settings: {
            analysis: {
              tokenizer: {
                standard: {
                  type: 'standard',
                },
              },
              filter: {
                lowercase_filter: {
                  type: 'lowercase',
                },
              },
              analyzer: {
                lowercase_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase_filter'],
                },
              },
            },
          },
          mappings: {
            properties: {
              name: { type: 'text' },
              slug: { type: 'keyword' },
              partNumber: { type: 'keyword' },
              description: { type: 'text' },
              keywords: { type: 'keyword' },
              productQuality: { type: 'keyword' },
              productType: { type: 'keyword' },
              images: { type: 'keyword' },
              store: {
                type: 'nested',
                properties: {
                  emails: { type: 'keyword' },
                  phones: { type: 'keyword' },
                  id: { type: 'keyword' },
                  name: { type: 'text' },
                  slug: { type: 'keyword' },
                  logo: { type: 'keyword' },
                  images: {
                    type: 'nested',
                    properties: {
                      id: { type: 'keyword' },
                      url: { type: 'keyword' },
                    },
                  },
                },
              },
              availableIn: {
                type: 'nested',
                properties: {
                  id: { type: 'keyword' },
                  address: { type: 'text' },
                  title: { type: 'text' },
                },
              },
              categories: {
                type: 'nested',
                properties: {
                  id: { type: 'keyword' },
                  name: { type: 'text' },
                },
              },
              compatibleVehicles: {
                type: 'nested',
                properties: {
                  id: { type: 'keyword' },
                  name: { type: 'text' },
                  year: { type: 'integer' },
                  doors: { type: 'integer' },
                  transmission: { type: 'keyword' },
                  fuel: { type: 'text' },
                },
              },
              id: { type: 'keyword' },
              universalCompatibility: { type: 'boolean' },
              price: { type: 'float' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        },
      });
    }
  }
}
