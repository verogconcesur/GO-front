import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import NotificationFilterDTO from '@data/models/notifications/notification-filter-dto';
import { FilterDrawerClassToExnted } from '@modules/feature-modules/filter-drawer/models/filter-drawer-class-to-extend.component';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-notifications-filter',
  templateUrl: './notifications-filter.component.html',
  styleUrls: ['./notifications-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationsFilterComponent extends FilterDrawerClassToExnted implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public labels: any = {
    dateFrom: marker('notifications.dateFrom'),
    dateTo: marker('notifications.dateTo'),
    notificationTypes: marker('notifications.notificationTypes'),
    readType: marker('notifications.readType'),
    CHANGE_STATE: marker('notifications.type.CHANGE_STATE'),
    EDIT_INFO: marker('notifications.type.EDIT_INFO'),
    ASIG_USER: marker('notifications.type.ASIG_USER'),
    END_WORK: marker('notifications.type.END_WORK'),
    ADD_COMMENT: marker('notifications.type.ADD_COMMENT'),
    ADD_DOC: marker('notifications.type.ADD_DOC'),
    ADD_MESSAGE_CLIENT: marker('notifications.type.ADD_MESSAGE_CLIENT'),
    READ: marker('notifications.readTypes.READ'),
    NO_READ: marker('notifications.readTypes.NO_READ'),
    ALL: marker('notifications.readTypes.ALL')
  };
  public filterForm: UntypedFormGroup;
  public typesList: string[] = ['ASIG_USER', 'END_WORK', 'ADD_MESSAGE_CLIENT'];
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

  public resetFilter(value?: NotificationFilterDTO): Observable<NotificationFilterDTO> {
    this.filterForm.reset();
    if (value) {
      this.filterForm.patchValue({
        dateNotificationFrom: value.dateNotificationFrom,
        dateNotificationTo: value.dateNotificationTo,
        notificationTypes: value?.notificationTypes,
        readFilterType: value.readFilterType
      });
    } else {
      this.filterForm.get('dateNotificationFrom').setValue(null);
      this.filterForm.get('dateNotificationTo').setValue(null);
      this.filterForm.get('notificationTypes').setValue([]);
      this.filterForm.get('readFilterType').setValue(null);
    }
    return of(this.filterForm.value);
  }
  public submitFilter(): Observable<NotificationFilterDTO> {
    return of(this.filterForm.value);
  }
  public isFilterFormTouchedOrDirty(): boolean {
    return this.filterForm?.touched && this.filterForm?.dirty;
  }
  public isFilterFormValid(): boolean {
    return this.filterForm?.valid;
  }
  public getFilterFormValue(): NotificationFilterDTO {
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
      dateNotificationFrom: [null],
      dateNotificationTo: [null],
      notificationTypes: [[]],
      readFilterType: [null]
    });
    ['dateNotificationFrom', 'dateNotificationTo', 'notificationTypes', 'readFilterType'].forEach((k) => {
      if (this.defaultValue && this.defaultValue[k]) {
        this.filterForm.get(k).setValue(this.defaultValue[k]);
      }
    });
  }
}
