/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from 'rxjs';

/**
 * @abstract @class FilterDrawerClassToExnted
 * @override resetFilter function
 * @override submitFilter function
 * @override isFilterFormTouchedOrDirty function
 * @override isFilterFormValid function
 */
export abstract class FilterDrawerClassToExnted {
  public defaultValue: any;

  constructor() {}

  public abstract resetFilter(value?: any): Observable<any>;

  public abstract submitFilter(): Observable<any>;

  public abstract isFilterFormTouchedOrDirty(): boolean;

  public abstract isFilterFormValid(): boolean;

  public abstract getFilterFormValue(): any;
}
