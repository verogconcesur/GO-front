import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import MentionFilterDTO from '@data/models/notifications/mention-filter-dto';
import { FilterDrawerClassToExnted } from '@modules/feature-modules/filter-drawer/models/filter-drawer-class-to-extend.component';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-mentions-filter',
  templateUrl: './mentions-filter.component.html',
  styleUrls: ['./mentions-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MentionsFilterComponent extends FilterDrawerClassToExnted implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public labels: any = {
    dateFrom: marker('notifications.dateFrom'),
    dateTo: marker('notifications.dateTo'),
    readType: marker('notifications.readType'),
    READ: marker('notifications.readTypes.READ'),
    NO_READ: marker('notifications.readTypes.NO_READ'),
    ALL: marker('notifications.readTypes.ALL')
  };
  public filterForm: UntypedFormGroup;
  public readTypes: string[] = ['READ', 'NO_READ', 'ALL'];
  constructor(private fb: UntypedFormBuilder, private filterDrawerService: FilterDrawerService) {
    super();
  }
  get form() {
    return this.filterForm.controls;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  public resetFilter(value?: MentionFilterDTO): Observable<MentionFilterDTO> {
    this.filterForm.reset();
    if (value) {
      this.filterForm.patchValue({
        dateCommentFrom: value.dateCommentFrom,
        dateCommentTo: value.dateCommentTo,
        readFilterType: value.readFilterType
      });
    } else {
      this.filterForm.get('dateCommentFrom').setValue(null);
      this.filterForm.get('dateCommentTo').setValue(null);
      this.filterForm.get('readFilterType').setValue(null);
    }
    return of(this.filterForm.value);
  }
  public submitFilter(): Observable<MentionFilterDTO> {
    return of(this.filterForm.value);
  }
  public isFilterFormTouchedOrDirty(): boolean {
    return this.filterForm?.touched && this.filterForm?.dirty;
  }
  public isFilterFormValid(): boolean {
    return this.filterForm?.valid;
  }
  public getFilterFormValue(): MentionFilterDTO {
    return this.filterForm?.value;
  }
  public changeDate(): void {
    this.filterForm.markAsTouched();
    this.filterForm.markAsDirty();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setDefaultValueAfterInit(data: any): void {
    this.defaultValue = data;
    this.filterDrawerService.filterValueSubject$.next(this.defaultValue);
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      dateCommentFrom: [null],
      dateCommentTo: [null],
      readFilterType: [null]
    });
    ['dateCommentFrom', 'dateCommentTo', 'readFilterType'].forEach((k) => {
      if (this.defaultValue && this.defaultValue[k]) {
        this.filterForm.get(k).setValue(this.defaultValue[k]);
      }
    });
  }
}
