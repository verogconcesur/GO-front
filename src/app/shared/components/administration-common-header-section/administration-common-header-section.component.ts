import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDetailsDTO from '@data/models/user-details-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-administration-common-header-section',
  templateUrl: './administration-common-header-section.component.html',
  styleUrls: ['./administration-common-header-section.component.scss']
})
export class AdministrationCommonHeaderSectionComponent implements OnInit {
  @Input() searchType: 'search' | 'filter' | '';
  @Input() buttonLabel: string;
  @Input() showSearchOfFilterInput = true;
  @Input() showFilterButton = false;
  @Input() title = '';
  @Input() areFiltersSettedAndActive = false;
  @Input() searchFn: (
    text: string
  ) => Observable<{ content: UserDetailsDTO[]; optionLabelFn: (option: UserDetailsDTO) => string } | null>;
  @Output() buttonCreateAction: EventEmitter<void> = new EventEmitter();
  @Output() buttonShowFilterDrawerAction: EventEmitter<void> = new EventEmitter();
  @Output() buttonSearchAction: EventEmitter<void> = new EventEmitter();
  filterTextSearchControl = new FormControl();
  filteredOptions: Observable<UserDetailsDTO[]>;
  transformOptionLabel: (opt: UserDetailsDTO) => string;

  public labels = {
    search: marker('common.search'),
    filter: marker('common.filterAction')
  };

  constructor() {}

  ngOnInit(): void {
    this.filteredOptions = this.filterTextSearchControl.valueChanges.pipe(
      untilDestroyed(this),
      switchMap((value) => this.filter(value))
    );
  }

  public resetFilter(): void {
    this.filterTextSearchControl.setValue(null);
  }

  public searchAction(): void {
    this.buttonSearchAction.emit(this.filterTextSearchControl.value);
  }

  public getSearchLabel(): string {
    if (this.searchType === 'search') {
      return this.labels.search;
    }
    return this.labels.filter;
  }

  private filter(value: string): Observable<UserDetailsDTO[]> {
    const filterValue = value && typeof value === 'string' ? value.toString().toLowerCase() : '';
    if (this.searchFn && this.searchType !== 'filter') {
      return this.searchFn(filterValue).pipe(
        take(1),
        map((result) => {
          if (result) {
            this.transformOptionLabel = result.optionLabelFn;
            return result.content;
          } else {
            return [];
          }
        })
      );
    } else {
      this.searchAction();
      return of([]);
    }
  }
}
