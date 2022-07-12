import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BrandDTO from '@data/models/brand-dto';
import DepartmentDTO from '@data/models/department-dto';
import FacilityDTO from '@data/models/facility-dto';
import SpecialtyDTO from '@data/models/specialty-dto';
import TemplatesBudgetDetailsDTO from '@data/models/templates-budget-details-dto';
import TemplatesBudgetDTO from '@data/models/templates-budget-dto';
import TemplatesFilterDTO from '@data/models/templates-filter-dto';
import { TemplatesBudgetsService } from '@data/services/templates-budgets.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionClassToExtend } from '@shared/components/administration-common-header-section/administration-common-header-section-class-to-extend';
import { FilterDrawerService } from '@shared/modules/filter-drawer/services/filter-drawer.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { map, take, finalize } from 'rxjs/operators';
import {
  CreateEditBudgetComponent,
  CreateEditBudgetComponentModalEnum
} from './dialog/create-edit-budget/create-edit-budget.component';

@UntilDestroy()
@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent extends AdministrationCommonHeaderSectionClassToExtend implements OnInit {
  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };
  public dataSource: TemplatesBudgetDTO[] = [];
  public paginationConfig = {
    length: 1,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    page: 0,
    ariaLabel: 'Select page'
  };
  private filterValue: TemplatesFilterDTO;
  private textSearchValue = '';

  constructor(
    private filterDrawerService: FilterDrawerService,
    private budgetService: TemplatesBudgetsService,
    private spinnerService: ProgressSpinnerDialogService,
    private customDialogService: CustomDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private confirmDialogService: ConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeFilterListener();
  }

  public headerCreateAction(): void {
    this.openCreateEditBudgetDialog();
  }

  public editAction(budget: TemplatesBudgetDTO): void {
    const spinner = this.spinnerService.show();
    this.budgetService
      .findById(budget.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe((b: TemplatesBudgetDetailsDTO) => {
        this.openCreateEditBudgetDialog(b);
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public headerGetFilteredData(text: string): Observable<{ content: any[]; optionLabelFn: (option: any) => string }> {
    this.textSearchValue = text;
    if (text.length >= 3) {
      return this.budgetService
        .searchBudgetsTemplates(
          {
            ...this.transformFilterValue(this.filterValue),
            search: this.textSearchValue
          },
          {
            page: 0,
            size: 20
          }
        )
        .pipe(
          take(1),
          map((response: PaginationResponseI<TemplatesBudgetDTO>) => ({
            content: response.content,
            optionLabelFn: this.optionLabelFn
          }))
        );
    } else {
      return of({
        content: [],
        optionLabelFn: this.optionLabelFn
      });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public headerSearchAction(opt: any): void {
    if (opt && typeof opt !== 'string') {
      this.textSearchValue = this.optionLabelFn(opt).toLowerCase();
    } else {
      opt = opt ? opt : '';
      this.textSearchValue = opt.toString().toLowerCase();
    }
    this.getData();
  }
  public getData(pageEvent?: PageEvent): void {
    const spinner = this.spinnerService.show();
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.budgetService
      .searchBudgetsTemplates(
        {
          ...this.transformFilterValue(this.filterValue),
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
      .subscribe((response: PaginationResponseI<TemplatesBudgetDTO>) => {
        this.paginationConfig.length = response.totalElements;
        this.dataSource = response.content;
      });
  }

  public deleteBudget(id: number) {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.budgets.deleteConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.budgetService
            .deleteBudgetById(id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                setTimeout(() => this.getData());
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }

  public optionLabelFn = (option: TemplatesBudgetDTO): string => {
    if (option) {
      let name = '';
      name += option.name ? option.name : '';
      return name;
    }
    return '';
  };

  private openCreateEditBudgetDialog = (budget?: TemplatesBudgetDetailsDTO): void => {
    this.customDialogService
      .open({
        id: CreateEditBudgetComponentModalEnum.ID,
        panelClass: CreateEditBudgetComponentModalEnum.PANEL_CLASS,
        component: CreateEditBudgetComponent,
        extendedComponentData: budget ? budget : null,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.getData();
        }
      });
  };

  private initializeFilterListener() {
    this.filterDrawerService.filterValueSubject$.pipe(untilDestroyed(this)).subscribe((filterValue: TemplatesFilterDTO) => {
      if (this.filterValue !== filterValue) {
        this.filterValue = filterValue;
        setTimeout(() => this.getData());
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformFilterValue = (filterValue: TemplatesFilterDTO): any => ({
    search: filterValue?.search,
    brands: filterValue?.brands?.map((brand: BrandDTO) => brand.id),
    departments: filterValue?.departments?.map((dep: DepartmentDTO) => dep.id),
    facilities: filterValue?.facilities?.map((fac: FacilityDTO) => fac.id),
    specialties: filterValue?.specialties?.map((spec: SpecialtyDTO) => spec.id)
  });
}
