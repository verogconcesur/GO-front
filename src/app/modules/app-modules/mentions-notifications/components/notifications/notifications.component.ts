import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import NotificationDataListDTO from '@data/models/notifications/notification-data-list-dto';
import NotificationFilterDTO from '@data/models/notifications/notification-filter-dto';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { NotificationService } from '@data/services/notifications.service';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { htmlToStringConverter } from '@shared/utils/html-to-string-function';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { NotificationsFilterComponent } from '../notifications-filter/notifications-filter.component';

@UntilDestroy()
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  public labels = {
    actions: marker('common.actions'),
    noDataToShow: marker('errors.noDataToShow'),
    information: marker('notifications.information')
  };
  public paginationConfig = {
    length: 1,
    pageSize: 10,
    pageSizeOptions: [10, 25, 100],
    page: 0,
    ariaLabel: 'Select page'
  };
  public displayedColumns = ['col1', 'col2', 'col3', 'information', 'actions'];
  public dataSource: NotificationDataListDTO[] = [];
  private filterValue: NotificationFilterDTO;

  constructor(
    private notificationService: NotificationService,
    private filterDrawerService: FilterDrawerService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setSidenavFilterDrawerConfiguration();
  }
  public markAsNoRead(item: NotificationDataListDTO): void {
    const spinner = this.spinnerService.show();
    this.notificationService
      .markNotificationAsNoRead(item.id)
      .pipe(take(1))
      .subscribe(
        () => {
          this.spinnerService.hide(spinner);
          this.getNotifications();
        },
        (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
  public markAsRead(item: NotificationDataListDTO): void {
    const spinner = this.spinnerService.show();
    this.notificationService
      .markNotificationAsRead(item.id)
      .pipe(take(1))
      .subscribe(
        () => {
          this.spinnerService.hide(spinner);
          this.getNotifications();
        },
        (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
  public goDetail(item: NotificationDataListDTO): void {
    const view = RouteConstants.WORKFLOWS_BOARD_VIEW;
    this.router.navigateByUrl(
      '/dashboard/workflow/' + view + '/(card:wcId/' + item.cardInstance.cardInstanceWorkflows[0].id + '/wuId/' + 'null' + ')'
    );
  }
  public getNotificationInfo(item: NotificationDataListDTO): string {
    return htmlToStringConverter(
      `${this.datePipe.transform(new Date(item.dateNotification), 'dd-MM-yyyy, HH:mm')}: ${item.notification}`
    );
  }
  public getItemIcon(item: NotificationDataListDTO): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    switch (item.notificationType as any) {
      case 'CHANGE_STATE':
        return 'redo';
      case 'EDIT_INFO':
        return 'edit';
      case 'ASIG_USER':
        return 'fiber_new';
      case 'END_WORK':
        return 'done_all';
      case 'ADD_COMMENT':
        return 'insert_comment';
      case 'ADD_DOC':
        return 'attach_file';
      case 'ADD_MESSAGE_CLIENT':
        return 'record_voice_over';
      default:
        return '';
    }
  }

  public getLabelInfo(card: WorkflowCardDTO, index: number): string {
    const tabItem = card && card.tabItems && card.tabItems.length > index ? card.tabItems[index] : null;
    if (!tabItem) {
      return '';
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let slot: any = null;
    switch (tabItem.typeItem) {
      case 'ACTION':
        slot = tabItem.tabItemConfigAction;
        break;
      case 'INPUT':
        slot = tabItem.tabItemConfigInput.cardTabItemInstance;
        break;
      case 'LINK':
        slot = tabItem.tabItemConfigLink;
        break;
      case 'LIST':
        slot = tabItem.tabItemConfigList.variable;
        break;
      case 'OPTION':
        slot = tabItem.tabItemConfigOption.variable;
        break;
      case 'TEXT':
        slot = tabItem.tabItemConfigText.variable;
        break;
      case 'TITLE':
        slot = tabItem.tabItemConfigTitle.variable;
        break;
      case 'VARIABLE':
        slot = tabItem.tabItemConfigVariable.variable;
        break;
    }
    const datePipe = new DatePipe('en-EN');
    const attrname = slot?.attributeName ? slot.attributeName : '';
    switch (attrname) {
      case 'dueOutDateTime':
        return this.translateService.instant('workflows.dueOutDateTime', {
          date: datePipe.transform(slot.value, 'dd/MM'),
          time: datePipe.transform(slot.value, 'HH:mm')
        });
      default:
        return slot?.value ? slot.value : null;
    }
  }
  //Invoked on search input
  public getFilteredData = (text: string): Observable<{ content: NotificationDataListDTO[] }> =>
    this.notificationService.searchNotifications(
      {
        ...this.transformFilterValue(this.filterValue)
      },
      {
        page: 0,
        size: 20
      }
    );

  public getNotifications = (pageEvent?: PageEvent): void => {
    const spinner = this.spinnerService.show();
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.notificationService
      .searchNotifications(
        {
          ...this.transformFilterValue(this.filterValue)
        },
        {
          page: this.paginationConfig.page,
          size: this.paginationConfig.pageSize
        }
      )
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe(
        (response: PaginationResponseI<NotificationDataListDTO>) => {
          this.paginationConfig.length = response.totalElements;
          this.dataSource = response.content;
        },
        (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  };

  public openFilterDialog = (): void => {
    this.filterDrawerService.toggleFilterDrawer();
  };

  public areFiltersSettedAndActive = (): boolean => {
    let activeFilters = false;
    if (
      !!this.filterValue?.dateNotificationFrom ||
      !!this.filterValue?.dateNotificationTo ||
      !!this.filterValue?.readFilterType ||
      (this.filterValue?.notificationTypes && this.filterValue?.notificationTypes?.length > 0)
    ) {
      activeFilters = true;
    }
    return activeFilters;
  };

  private setSidenavFilterDrawerConfiguration = () => {
    this.filterDrawerService.setComponentToShowInsideFilterDrawer(NotificationsFilterComponent, this.filterValue);
    this.filterDrawerService.filterValueSubject$.pipe(untilDestroyed(this)).subscribe((filterValue: NotificationFilterDTO) => {
      if (this.filterValue !== filterValue) {
        setTimeout(() => this.getNotifications());
      }
      this.filterValue = filterValue;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformFilterValue = (filterValue: NotificationFilterDTO): any => ({
    dateNotificationFrom: filterValue?.dateNotificationFrom,
    dateNotificationTo: filterValue?.dateNotificationTo,
    notificationTypes: filterValue?.notificationTypes?.length > 0 ? filterValue?.notificationTypes : [],
    readFilterType: filterValue?.readFilterType ? filterValue.readFilterType : 'ALL'
  });
}
