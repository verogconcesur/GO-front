import SortI from './pagination-sort';

export default interface PaginationRequestI {
  offset?: number;
  pageNumber?: number;
  pageSize?: number;
  paged?: boolean;
  sort?: SortI;
  unpaged?: boolean;

  page?: number;
  size?: number;
}
