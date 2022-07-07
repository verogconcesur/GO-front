/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';

/**
 * @abstract @class AdministrationCommonHeaderSectionClassToExtend
 * @override headerCreateAction function
 * @override optional headerGetFilteredData function
 * @override optional headerShowFilterDrawerAction function
 * @override optional headerSearchAction function
 * @override optional headerAreFiltersSettedAndActive function
 * @override getData function
 */
export abstract class AdministrationCommonHeaderSectionClassToExtend {
  constructor() {}

  public headerGetFilteredData?(text: string): Observable<{ content: any[]; optionLabelFn: (option: any) => string } | null>;

  public headerShowFilterDrawerAction?(): void;

  public headerSearchAction?(option: any): void;

  public headerAreFiltersSettedAndActive?(): boolean;

  public abstract headerCreateAction(): void;

  public abstract getData(pageEvent?: PageEvent): void;
}
