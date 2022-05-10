import { ConcenetError } from './error';

export type ServiceResponse<T> = {
  /**
   * Service response data
   */
  data: T;

  /**
   * Response error
   */
  error: ConcenetError;
};
