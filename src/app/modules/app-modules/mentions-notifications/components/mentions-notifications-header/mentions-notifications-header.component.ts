import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-mentions-notifications-header',
  templateUrl: './mentions-notifications-header.component.html',
  styleUrls: ['./mentions-notifications-header.component.scss']
})
export class MentionsNotificationsHeaderComponent implements OnInit {
  @Input() buttonSmallLabel: string;
  @Input() showSearchOfFilterInput = true;
  @Input() title = '';
  @Input() areFiltersSettedAndActive = false;
  @Input() areSearchActive = false;
  @Output() buttonShowFilterDrawerAction: EventEmitter<void> = new EventEmitter();
  @Output() buttonSearchAction: EventEmitter<void> = new EventEmitter();
  filterTextSearchControl = new UntypedFormControl();

  public labels = {
    search: marker('common.search')
  };

  constructor() {}

  ngOnInit(): void {}

  public resetFilter(): void {
    this.filterTextSearchControl.setValue(null);
  }

  public searchAction(): void {
    this.buttonSearchAction.emit(this.filterTextSearchControl.value);
  }

  public getSearchLabel(): string {
    return this.labels.search;
  }
}
