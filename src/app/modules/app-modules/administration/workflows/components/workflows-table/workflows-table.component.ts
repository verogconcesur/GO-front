import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import WorkflowDTO, { WorkFlowStatusEnum } from '@data/models/workflows/workflow-dto';
import { WorkflowSearchFilterDTO } from '@data/models/workflows/workflow-filter-dto';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { WorkflowsService } from '@data/services/workflows.service';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
import { WorkflowsFilterComponent } from '../workflows-filter/workflows-filter.component';

@UntilDestroy()
@Component({
  selector: 'app-workflows-table',
  templateUrl: './workflows-table.component.html',
  styleUrls: ['./workflows-table.component.scss']
})
export class WorkflowsTableComponent implements OnInit {
  public labels = {
    name: marker('common.name'),
    permissionsGroup: marker('users.permissionsGroup'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    actions: marker('common.actions'),
    noDataToShow: marker('errors.noDataToShow'),
    status: marker('common.state')
  };
  public paginationConfig = {
    length: 1,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    page: 0,
    ariaLabel: 'Select page'
  };
  public dataSource: WorkflowDTO[] = [];
  public displayedColumns = ['name', 'brand', 'facility', 'department', 'specialty', 'status', 'actions'];
  private textSearchValue = '';
  private filterValue: WorkflowSearchFilterDTO;

  constructor(
    private workflowService: WorkflowsService,
    public workflowAdminService: WorkflowAdministrationService,
    private filterDrawerService: FilterDrawerService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setInitialFilterValue();
    this.setSidenavFilterDrawerConfiguration();
  }

  public setInitialFilterValue(): void {
    const historyState = history.state as {
      brands: BrandDTO[];
      departments: DepartmentDTO[];
      facilities: FacilityDTO[];
      specialties: SpecialtyDTO[];
    };
    this.filterValue = {
      brands: historyState?.brands ? historyState.brands : [],
      departments: historyState?.departments ? historyState.departments : [],
      facilities: historyState?.facilities ? historyState.facilities : [],
      specialties: historyState?.specialties ? historyState.specialties : [],
      status: null,
      search: ''
    };
  }

  //Invoked on search input
  public getFilteredData = (
    text: string
  ): Observable<{ content: WorkflowDTO[]; optionLabelFn: (option: WorkflowDTO) => string }> => {
    this.textSearchValue = text;
    if (text.length >= 3) {
      return this.workflowService
        .searchWorkflows(
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
          map((response: PaginationResponseI<WorkflowDTO>) => ({
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
  };

  public getWfStatusLabel(wf: WorkflowDTO): string {
    switch (wf.status) {
      case 'DRAFT':
        return marker('workflows.draft');
      case 'PUBLISHED':
        return marker('workflows.published');
      default:
        return '';
    }
  }

  public goToEditWorkflow(wf: WorkflowDTO): void {
    this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.ADM_WORKFLOWS, RouteConstants.EDIT, wf.id]);
  }

  public getWorkflows = (pageEvent?: PageEvent): void => {
    const spinner = this.spinnerService.show();
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.workflowService
      .searchWorkflows(
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
      .subscribe(
        (response: PaginationResponseI<WorkflowDTO>) => {
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

  public optionLabelFn = (option: WorkflowDTO): string => {
    if (option) {
      return option.name;
    }
    return '';
  };

  public openFilterDialog = (): void => {
    this.filterDrawerService.toggleFilterDrawer();
  };

  public showFilterOptionSelected = (opt?: WorkflowDTO | string): void => {
    if (opt && typeof opt !== 'string') {
      this.textSearchValue = this.optionLabelFn(opt).toLowerCase();
    } else {
      opt = opt ? opt : '';
      this.textSearchValue = opt.toString().toLowerCase();
    }
    this.getWorkflows();
  };

  public areFiltersSettedAndActive = (): boolean =>
    this.filterValue?.brands?.length > 0 ||
    this.filterValue?.departments?.length > 0 ||
    this.filterValue?.facilities?.length > 0 ||
    this.filterValue?.specialties?.length > 0 ||
    this.filterValue?.status?.length > 0;

  public getOrganizationLabel = (data: BrandDTO[] | FacilityDTO[] | DepartmentDTO[] | SpecialtyDTO[]): string => {
    let label = '';
    data = data && Array.isArray(data) ? data : [];
    data.forEach((item: BrandDTO | FacilityDTO | DepartmentDTO | SpecialtyDTO) => {
      if (label) {
        label += ', ';
      }
      label += item.name;
    });
    return label;
  };
  public publishWorkflow(wf: WorkflowDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('workflows.publishWarn'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.workflowAdminService
            .changeStatus(wf.id, WorkFlowStatusEnum.published)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: () => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.getWorkflows();
              },
              error: (error: ConcenetError) => {
                this.globalMessageService.showError({
                  message: this.translateService.instant(error.message),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }
  public unPublishWorkflow(wf: WorkflowDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('workflows.draftWarn'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.workflowAdminService
            .changeStatus(wf.id, WorkFlowStatusEnum.draft)
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.getWorkflows();
              },
              error: (error: ConcenetError) => {
                this.globalMessageService.showError({
                  message: this.translateService.instant(error.message),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }
  public duplicateWorkflow(wf: WorkflowDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('workflows.duplicateWarn'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.workflowService
            .duplicateWorkflow(wf.id)
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.getWorkflows();
              },
              error: (error: ConcenetError) => {
                this.globalMessageService.showError({
                  message: this.translateService.instant(error.error),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }

  public deleteWorkflow = (wf: WorkflowDTO): void => {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('workflows.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.workflowService
            .deleteWorkflow(wf.id)
            .pipe(take(1))
            .subscribe({
              next: (response) => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.getWorkflows();
              },
              error: (error: ConcenetError) => {
                this.globalMessageService.showError({
                  message: this.translateService.instant(error.error),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  private setSidenavFilterDrawerConfiguration = () => {
    this.filterDrawerService.setComponentToShowInsideFilterDrawer(WorkflowsFilterComponent, {
      brands: this.filterValue?.brands ? this.filterValue.brands : [],
      departments: this.filterValue?.departments ? this.filterValue.departments : [],
      facilities: this.filterValue?.facilities ? this.filterValue.facilities : [],
      specialties: this.filterValue?.specialties ? this.filterValue.specialties : [],
      status: this.filterValue?.status ? this.filterValue.status : null
    });
    this.filterDrawerService.filterValueSubject$.pipe(untilDestroyed(this)).subscribe((filterValue: WorkflowSearchFilterDTO) => {
      if (this.filterValue !== filterValue) {
        setTimeout(() => this.getWorkflows());
      }
      this.filterValue = filterValue;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformFilterValue = (filterValue: WorkflowSearchFilterDTO): any => ({
    status: filterValue?.status,
    search: filterValue?.search,
    brands: filterValue?.brands?.map((brand: BrandDTO) => brand.id),
    departments: filterValue?.departments?.map((dep: DepartmentDTO) => dep.id),
    facilities: filterValue?.facilities?.map((fac: FacilityDTO) => fac.id),
    specialties: filterValue?.specialties?.map((spec: SpecialtyDTO) => spec.id)
  });
}
