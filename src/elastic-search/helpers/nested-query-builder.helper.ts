import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

export const nestedQueryBuilder = ({
  fields,
  path,
  search,
}: {
  path: string;
  fields: string[];
  search: string;
}): QueryDslQueryContainer => {
  return {
    nested: {
      path,
      query: {
        bool: {
          should: [
            {
              multi_match: {
                operator: 'and',
                fuzziness: 'AUTO',
                zero_terms_query: 'all',
                query: search,
                fields,
              },
            },
          ],
        },
      },
    },
  };
};
