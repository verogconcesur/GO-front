import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import TemplatesFilterDTO from '@data/models/templates/templates-filter-dto';
import TemplatesTimelineDTO from '@data/models/templates/templates-timeline-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
// eslint-disable-next-line max-len
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import { TemplatesTimelineService } from '@data/services/templates-timeline.service';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionClassToExtend } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section-class-to-extend';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
import {
  CreateEditTimelineComponent,
  CreateEditTimelineComponentModalEnum
} from './dialog/create-edit-timeline/create-edit-timeline.component';
@UntilDestroy()
@Component({
  selector: 'app-client-timeline',
  templateUrl: './client-timeline.component.html',
  styleUrls: ['./client-timeline.component.scss']
})
export class ClientTimelineComponent extends AdministrationCommonHeaderSectionClassToExtend implements OnInit {
  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };
  public dataSource: TemplatesCommonDTO[] = [];
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
    private timelineService: TemplatesTimelineService,
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
    this.openCreateEditTimelineDialog();
  }

  public editAction(attachment: TemplatesCommonDTO): void {
    const spinner = this.spinnerService.show();
    this.timelineService
      .findById(attachment.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe((b: TemplatesTimelineDTO) => {
        //timeout necesario porque hay casos en los que no llega a mostrar la modal
        setTimeout(() => {
          this.openCreateEditTimelineDialog(b);
        });
      });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public headerGetFilteredData(text: string): Observable<{ content: any[]; optionLabelFn: (option: any) => string }> {
    this.textSearchValue = text;
    if (text.length >= 3) {
      return this.timelineService
        .searchTimelineTemplates(
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
          map((response: PaginationResponseI<TemplatesCommonDTO>) => ({
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
    this.timelineService
      .searchTimelineTemplates(
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
      .subscribe((response: PaginationResponseI<TemplatesCommonDTO>) => {
        this.paginationConfig.length = response.totalElements;
        this.dataSource = response.content;
      });
  }

  public deleteTimeline(id: number) {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.attachments.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.timelineService
            .deleteTimelineById(id)
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

  public optionLabelFn = (option: TemplatesCommonDTO): string => {
    if (option) {
      let name = '';
      name += option.name ? option.name : '';
      return name;
    }
    return '';
  };

  private openCreateEditTimelineDialog = (timeline?: TemplatesTimelineDTO): void => {
    this.customDialogService
      .open({
        id: CreateEditTimelineComponentModalEnum.ID,
        panelClass: CreateEditTimelineComponentModalEnum.PANEL_CLASS,
        component: CreateEditTimelineComponent,
        extendedComponentData: timeline ? timeline : null,
        disableClose: true,
        width: '750px'
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
