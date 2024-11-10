import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { nestedQueryBuilder } from './nested-query-builder.helper';
import { SearchProductDto } from 'src/products/dto/search-product.dto';

export const searchProductsQueryBuilder = (
  searchProductDto: SearchProductDto,
): QueryDslQueryContainer => {
  const { productQuality, productType, search, categoryId, vehicleId } =
    searchProductDto;
  const mustQueries: QueryDslQueryContainer[] = [];

  if (search) {
    mustQueries.push(
      {
        multi_match: {
          operator: 'and',
          fuzziness: 'AUTO',
          zero_terms_query: 'all',
          minimum_should_match: 1,
          query: search,
          fields: [
            'name',
            'partNumber',
            'description',
            'productQuality',
            'productType',
            'keywords',
          ],
        },
      },
      nestedQueryBuilder({
        path: 'compatibleVehicles',
        fields: [
          'compatibleVehicles.name',
          'compatibleVehicles.transmission',
          'compatibleVehicles.fuel',
        ],
        search,
      }),
      nestedQueryBuilder({
        path: 'categories',
        fields: ['categories.name'],
        search,
      }),
      nestedQueryBuilder({
        path: 'store',
        fields: ['store.name'],
        search,
      }),
      nestedQueryBuilder({
        path: 'availableIn',
        fields: ['availableIn.title', 'availableIn.address'],
        search,
      }),
    );
  }

  if (productType) {
    mustQueries.push({ term: { productType: productType.toUpperCase() } });
  }

  if (productQuality) {
    mustQueries.push({
      term: { productQuality: productQuality.toUpperCase() },
    });
  }

  if (categoryId) {
    mustQueries.push({
      nested: {
        path: 'categories',
        query: {
          term: { 'categories.id': categoryId },
        },
      },
    });
  }

  if (vehicleId) {
    mustQueries.push({
      nested: {
        path: 'compatibleVehicles',
        query: {
          term: { 'compatibleVehicles.id': vehicleId },
        },
      },
    });
  }

  const query = mustQueries.length
    ? {
        bool: {
          should: mustQueries,
          minimum_should_match: 1,
        },
      }
    : { match_all: {} };

  return query;
};
