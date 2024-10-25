interface PaginationProps<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

export const paginationResponse = <T>({
  data,
  totalPages,
  page,
  total,
}: PaginationProps<T>) => {
  return {
    data,
    pagination: {
      page,
      totalPages,
      total,
    },
  };
};
