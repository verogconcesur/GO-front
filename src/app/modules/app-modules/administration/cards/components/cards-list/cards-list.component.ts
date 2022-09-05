import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BasicFilterDTO from '@data/models/basic-filter-dto';
import CardDTO from '@data/models/cards/card-dto';
import { CardService } from '@data/services/card.service';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { take, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cards-list',
  templateUrl: './cards-list.component.html',
  styleUrls: ['./cards-list.component.scss']
})
export class CardsListComponent implements OnInit {
  public labels = {
    name: marker('common.name'),
    actions: marker('common.actions'),
    noDataToShow: marker('errors.noDataToShow')
  };

  public paginationConfig = {
    length: 1,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    page: 0,
    ariaLabel: 'Select page'
  };
  public displayedColumns = ['name', 'actions'];
  public dataSource: CardDTO[] = [];
  private textSearchValue = '';

  constructor(
    private cardService: CardService,
    private filterDrawerService: FilterDrawerService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setSidenavFilterDrawerConfiguration();
  }

  public openCreateEditCardDialog = (card?: CardDTO): void => {
    this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.CARDS, RouteConstants.CREATE]);
  };

  public openFilterCardDialog = (): void => {
    this.filterDrawerService.toggleFilterDrawer();
  };

  public showFilterOptionSelected = (opt?: CardDTO | string): void => {
    if (opt && typeof opt !== 'string') {
      this.textSearchValue = opt.name.toLowerCase();
    } else {
      opt = opt ? opt : '';
      this.textSearchValue = opt.toString().toLowerCase();
    }
    this.getCards();
  };

  //Invoked on search input
  public getFilteredData = (text: string): Observable<{ content: CardDTO[] }> => {
    this.textSearchValue = text;
    if (text.length >= 3) {
      return this.cardService.searchCards(
        {
          search: this.textSearchValue
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
  public getCards = (pageEvent?: PageEvent): void => {
    const spinner = this.spinnerService.show();
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.cardService
      .searchCards(
        {
          search: this.textSearchValue
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
      .subscribe((response: PaginationResponseI<CardDTO>) => {
        this.paginationConfig.length = response.totalElements;
        this.dataSource = response.content;
      });
  };

  public deleteCard = (card: CardDTO): void => {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.cardService
            .deleteCard(card.id)
            .pipe(take(1))
            .subscribe({
              next: (response) => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.getCards();
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  public duplicateCard = (card: CardDTO): void => {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.duplicateConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.cardService
            .duplicateCard(card.id)
            .pipe(take(1))
            .subscribe({
              next: (response) => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.getCards();
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  private setSidenavFilterDrawerConfiguration = () => {
    this.filterDrawerService.filterValueSubject$.pipe(untilDestroyed(this)).subscribe((filterValue: BasicFilterDTO) => {
      setTimeout(() => this.getCards());
    });
  };
}
