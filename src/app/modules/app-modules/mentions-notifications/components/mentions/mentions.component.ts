import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import MentionDataListDTO from '@data/models/notifications/mention-data-list-dto';
import MentionFilterDTO from '@data/models/notifications/mention-filter-dto';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { NotificationService } from '@data/services/notifications.service';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { htmlToStringConverter } from '@shared/utils/html-to-string-function';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { MentionsFilterComponent } from '../mentions-filter/mentions-filter.component';

@UntilDestroy()
@Component({
  selector: 'app-mentions',
  templateUrl: './mentions.component.html',
  styleUrls: ['./mentions.component.scss']
})
export class MentionsComponent implements OnInit {
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
  public dataSource: MentionDataListDTO[] = [];
  private filterValue: MentionFilterDTO;

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
  public markAsNoRead(item: MentionDataListDTO): void {
    const spinner = this.spinnerService.show();
    this.notificationService
      .markMentionAsNoRead(item.cardInstanceCommentId)
      .pipe(take(1))
      .subscribe(
        () => {
          this.spinnerService.hide(spinner);
          this.getMentions();
          this.notificationService.updateUnreadMentionsCount();
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
  public markAsRead(item: MentionDataListDTO): void {
    const spinner = this.spinnerService.show();
    this.notificationService
      .markMentionAsRead(item.cardInstanceCommentId)
      .pipe(take(1))
      .subscribe(
        () => {
          this.spinnerService.hide(spinner);
          this.getMentions();
          this.notificationService.updateUnreadMentionsCount();
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
  public goDetail(item: MentionDataListDTO): void {
    const view = RouteConstants.WORKFLOWS_BOARD_VIEW;
    this.router.navigateByUrl(
      '/dashboard/workflow/' +
        view +
        '/(card:wcId/' +
        item.cardInstance.cardInstanceWorkflows[0].id +
        '/wuId/' +
        'null' +
        '/from/mentions)'
    );
  }
  public getMentionInfo(item: MentionDataListDTO): string {
    return htmlToStringConverter(`${this.datePipe.transform(new Date(item.dateComment), 'dd-MM-yyyy, HH:mm')}: ${item.comment}`);
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
        let found = null;
        if (tabItem.tabItemConfigList?.listItems?.length && tabItem.tabItemConfigList?.cardTabItemInstance?.value) {
          found = tabItem.tabItemConfigList.listItems.find(
            (item) => item.code === tabItem.tabItemConfigList.cardTabItemInstance.value
          );
        }
        if (found) {
          slot = found;
        } else {
          slot = tabItem.tabItemConfigList.cardTabItemInstance;
        }
        break;
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
    const dataType = slot?.dataType ? slot.dataType : '';
    const attrname = slot?.attributeName ? slot.attributeName : '';
    if (attrname === 'dueOutDateTime') {
      return this.translateService.instant('workflows.dueOutDateTime', {
        date: datePipe.transform(slot.value, 'dd/MM'),
        time: datePipe.transform(slot.value, 'HH:mm')
      });
    }
    switch (dataType) {
      case 'DATE':
        return datePipe.transform(slot.value, 'dd/MM/YYYY');
      case 'DATETIME':
        return datePipe.transform(slot.value, 'dd/MM/YYYY, HH:mm');
      default:
        return slot?.value ? slot.value : null;
    }
  }

  //Invoked on search input
  public getFilteredData = (text: string): Observable<{ content: MentionDataListDTO[] }> => {
    this.filterValue.text = text;
    if (text.length >= 3) {
      return this.notificationService.searchMentions(
        {
          ...this.transformFilterValue(this.filterValue)
        },
        {
          page: 0,
          size: 20
        }
      );
    } else {
      return of({
        content: []
      });
    }
  };

  public getMentions = (pageEvent?: PageEvent): void => {
    const spinner = this.spinnerService.show();
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.notificationService
      .searchMentions(
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
        (response: PaginationResponseI<MentionDataListDTO>) => {
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

  public showFilterOptionSelected = (opt?: MentionDataListDTO | string): void => {
    opt = opt ? opt : '';
    this.filterValue.text = opt.toString().toLowerCase();
    this.getMentions();
  };

  public areFiltersSettedAndActive = (): boolean => {
    let activeFilters = false;
    if (!!this.filterValue?.dateCommentFrom || !!this.filterValue?.dateCommentTo || !!this.filterValue?.readFilterType) {
      activeFilters = true;
    }
    return activeFilters;
  };

  private setSidenavFilterDrawerConfiguration = () => {
    this.filterDrawerService.setComponentToShowInsideFilterDrawer(MentionsFilterComponent, this.filterValue);
    this.filterDrawerService.filterValueSubject$.pipe(untilDestroyed(this)).subscribe((filterValue: MentionFilterDTO) => {
      if (this.filterValue !== filterValue) {
        setTimeout(() => this.getMentions());
      }
      this.filterValue = filterValue;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformFilterValue = (filterValue: MentionFilterDTO): any => ({
    dateCommentFrom: filterValue?.dateCommentFrom,
    dateCommentTo: filterValue?.dateCommentTo,
    readFilterType: filterValue?.readFilterType ? filterValue.readFilterType : 'ALL',
    text: filterValue?.text ? filterValue.text : ''
  });
}
