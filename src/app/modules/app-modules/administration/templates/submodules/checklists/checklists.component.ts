import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import TemplatesChecklistsDTO, { TemplateChecklistItemDTO } from '@data/models/templates/templates-checklists-dto';
import TemplatesFilterDTO from '@data/models/templates/templates-filter-dto';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { CustomDialogService } from '@jenga/custom-dialog';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionClassToExtend } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section-class-to-extend';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
@UntilDestroy()
@Component({
  selector: 'app-checklists',
  templateUrl: './checklists.component.html',
  styleUrls: ['./checklists.component.scss']
})
export class ChecklistsComponent extends AdministrationCommonHeaderSectionClassToExtend implements OnInit {
  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };
  public dataSource: TemplatesChecklistsDTO[] = [];
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
    private router: Router,
    private filterDrawerService: FilterDrawerService,
    private checklistService: TemplatesChecklistsService,
    private spinnerService: ProgressSpinnerDialogService,
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
    this.openCreateEditChecklistDialog();
  }

  public editAction(checklist: TemplatesChecklistsDTO): void {
    const spinner = this.spinnerService.show();
    this.checklistService
      .addOrEditChecklist(checklist)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe((b: TemplatesChecklistsDTO) => {
        //timeout necesario porque hay casos en los que no llega a mostrar la modal
        setTimeout(() => {
          this.openCreateEditChecklistDialog(b);
        });
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public headerGetFilteredData(text: string): Observable<{ content: any[]; optionLabelFn: (option: any) => string }> {
    this.textSearchValue = text;
    if (text.length >= 3) {
      return this.checklistService
        .searchChecklistsTemplates(
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
          map((response: PaginationResponseI<TemplatesChecklistsDTO>) => ({
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
    this.checklistService
      .searchChecklistsTemplates(
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
      .subscribe((response: PaginationResponseI<TemplatesChecklistsDTO>) => {
        this.paginationConfig.length = response.totalElements;
        this.dataSource = response.content;
      });
  }

  public deleteChecklist(id: number) {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.checklists.deleteConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.checklistService
            .deleteChecklistById(id)
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

  public optionLabelFn = (option: TemplatesChecklistsDTO): string => {
    if (option) {
      let name = '';
      name += option.template?.name ? option.template.name : '';
      return name;
    }
    return '';
  };

  private openCreateEditChecklistDialog = (checklist?: TemplatesChecklistsDTO): void => {
    if (checklist?.id) {
      this.router.navigate([
        RouteConstants.ADMINISTRATION,
        RouteConstants.TEMPLATES,
        RouteConstants.CREATE_EDIT_CHECKLIST,
        checklist.id
      ]);
    } else {
      this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.CREATE_EDIT_CHECKLIST]);
    }
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
