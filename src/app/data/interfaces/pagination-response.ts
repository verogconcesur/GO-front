import SortI from './pagination-sort';

export default interface PaginationResponseI<T> {
  pageable: {
    sort: SortI;
    pageSize: number;
    pageNumber: number;
    offset: number;
    unpaged: false;
    paged: true;
  };
  totalElements: number;
  totalPages: number;
  last: true;
  numberOfElements: number;
  first: true;
  sort: SortI;
  size: number;
  // eslint-disable-next-line id-blacklist
  number: number;
  content: T[];
}
