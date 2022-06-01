import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDetailsDTO from '@data/models/user-details-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of } from 'rxjs';
import { delay, filter, map, startWith, switchMap } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-users-header',
  templateUrl: './users-header.component.html',
  styleUrls: ['./users-header.component.scss']
})
export class UsersHeaderComponent implements OnInit {
  @Input() buttonLabel: string;
  @Input() showFilterButton: boolean;
  @Input() areFiltersSettedAndActive: boolean;
  @Input() searchFn: (
    text: string
  ) => Observable<{ content: UserDetailsDTO[]; optionLabelFn: (option: UserDetailsDTO) => string }>;
  @Output() buttonCreateAction: EventEmitter<void> = new EventEmitter();
  @Output() buttonShowFilterDrawerAction: EventEmitter<void> = new EventEmitter();
  @Output() buttonSearchAction: EventEmitter<void> = new EventEmitter();
  filterTextSearchControl = new FormControl();
  filteredOptions: Observable<UserDetailsDTO[]>;
  transformOptionLabel: (opt: UserDetailsDTO) => string;

  public labels = {
    search: marker('common.search'),
    title: marker('administration.users')
  };

  constructor() {}

  ngOnInit(): void {
    this.filteredOptions = this.filterTextSearchControl.valueChanges.pipe(
      untilDestroyed(this),
      switchMap((value) => this.filter(value))
    );
  }

  public searchAction(): void {
    this.buttonSearchAction.emit(this.filterTextSearchControl.value);
  }

  private filter(value: string): Observable<UserDetailsDTO[]> {
    const filterValue = value && typeof value === 'string' ? value.toString().toLowerCase() : '';
    return this.searchFn(filterValue).pipe(
      map((result) => {
        this.transformOptionLabel = result.optionLabelFn;
        return result.content;
      })
    );
  }
}
