import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import AdvSearchDTO from '@data/models/adv-search/adv-search-dto';
import { AdvSearchService } from '@data/services/adv-search.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { replacerFunc } from '@shared/utils/replacer-function';
import moment from 'moment';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-adv-search-card-table',
  templateUrl: './adv-search-card-table.component.html',
  styleUrls: ['./adv-search-card-table.component.scss']
})
export class AdvSearchCardTableComponent implements OnInit {
  public labels = {
    noDataToShow: marker('errors.noDataToShow'),
    title: marker('advSearch.information.title'),
    step1: marker('advSearch.information.step1'),
    step2: marker('advSearch.information.step2'),
    step3: marker('advSearch.information.step3'),
    step4: marker('advSearch.information.step4')
  };
  public paginationConfig = {
    length: 1,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    page: 0,
    ariaLabel: 'Select page'
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dataSource: any[] = [];
  public advSearchFilter: AdvSearchDTO;
  public displayedColumns: string[];
  constructor(
    private advSearchService: AdvSearchService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public getData = (pageEvent?: PageEvent): void => {
    const spinner = this.spinnerService.show();
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.advSearchService
      .executeSearch(this.advSearchFilter, {
        page: this.paginationConfig.page,
        size: this.paginationConfig.pageSize
      })
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (response) => {
          this.paginationConfig.length = response.totalElements;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.dataSource = response.content.map((item: any) => ({
            ...item,
            'vCalendarCardInstance.id': `${item['cardInstanceWorkflow.id']}-${item['workflow.id']}-${item['user.id']}`,
            'vCalendarCardInstance.dateEvent': moment(item['vCalendarCardInstance.dateEvent']).format('D/M/YYYY HH:mm')
          }));
          this.spinnerService.hide(spinner);
        },
        error: (error: ConcenetError) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  executeSearch(filter?: AdvSearchDTO): void {
    this.displayedColumns = [];
    this.dataSource = [];
    if (filter) {
      console.log('executeSearch', filter);
      this.advSearchFilter = filter;
      this.advSearchFilter.advancedSearchCols.forEach((element) => {
        if (element.variable && element.variable.name) {
          this.displayedColumns.push(element.variable.name);
        } else if (element.tabItem && element.tabItem.name) {
          this.displayedColumns.push(element.tabItem.name);
        }
      });
      this.displayedColumns.push(marker('vCalendarCardInstance.id'));
      this.displayedColumns.push(marker('vCalendarCardInstance.dateEvent'));
      this.getData();
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goDetailCard(item: any): void {
    this.router.navigate(
      [
        {
          outlets: {
            card: [
              RouteConstants.WORKFLOWS_ID_CARD,
              item['cardInstanceWorkflow.id'],
              RouteConstants.WORKFLOWS_ID_USER,
              item['user.id'] ? item['user.id'] : null
            ]
          }
        }
      ],
      {
        relativeTo: this.route,
        state: {
          relativeTo: JSON.stringify(this.route, replacerFunc)
        }
      }
    );
  }
  ngOnInit(): void {}
}
