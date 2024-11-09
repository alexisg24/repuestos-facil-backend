import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { nestedQueryBuilder } from './nested-query-builder.helper';

export const searchProductsQueryBuilder = (
  search?: string,
): QueryDslQueryContainer => {
  let query: QueryDslQueryContainer = {
    match_all: {},
  };

  if (search) {
    query = {
      bool: {
        should: [
          {
            multi_match: {
              operator: 'and',
              fuzziness: 'AUTO',
              zero_terms_query: 'all',
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
          // Aquí puedes añadir una consulta 'nested' para buscar en los campos anidados
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
        ],
        minimum_should_match: 1, // Asegura que al menos una de las condiciones sea cierta
      },
    };
  }

  return query;
};
