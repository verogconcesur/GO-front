import PaginationRequestI from '@data/interfaces/pagination-request';

export const getPaginationUrlGetParams = (pagination: PaginationRequestI, firstParam: boolean = false): string => {
  let getParams = firstParam ? '?' : '';
  Object.keys(pagination).forEach((k) => {
    if (getParams && getParams !== '?') {
      getParams += '&';
    }
    getParams += `${k}=${pagination[k as keyof PaginationRequestI]}`;
  });
  return getParams;
};
