import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import DepartmentDTO from '@data/models/department-dto';
import { DepartmentService } from '@data/services/deparment.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap, take, finalize } from 'rxjs/operators';
import {
  CreateEditDepartmentComponent,
  CreateEditDepartmentComponentModalEnum
} from '../create-edit-department/create-edit-department.component';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit {
  public departments$: Observable<DepartmentDTO[]>;

  public labels = {
    title: marker('organizations.departments.title'),
    createActionLabel: marker('organizations.departments.create'),
    noDataToShow: marker('errors.noDataToShow')
  };
  public hasDepartments = false;
  private brandId: number;
  private facilityId: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private departmentsService: DepartmentService,
    private customDialogService: CustomDialogService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private logger: NGXLogger,
    private confirmationDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.brandId = parseInt(this.route.snapshot.paramMap.get('idBrand'), 10);
    this.facilityId = parseInt(this.route.snapshot.paramMap.get('idFacility'), 10);
    this.getDepartments();
  }

  public goTo(department: DepartmentDTO) {
    this.router.navigate(
      [
        `${RouteConstants.ADMINISTRATION}/${RouteConstants.ORGANIZATION}/` +
          `${RouteConstants.BRANDS}/${this.brandId}/` +
          `${RouteConstants.FACILITIES}/${this.facilityId}/` +
          `${RouteConstants.DEPARTMENTS}/${department.id}/` +
          `${RouteConstants.SPECIALTIES}`
      ],
      { state: { department } }
    );
  }

  public buttonCreateEditAction(department?: DepartmentDTO) {
    if (department) {
      const spinner = this.spinnerService.show();
      this.departmentsService
        .getDepartmentsById(department.id)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe((f: DepartmentDTO) => {
          this.openEditCreateModal(f);
        });
    } else {
      this.openEditCreateModal();
    }
  }

  public getSubtitle(item: DepartmentDTO): Observable<string> {
    return this.translateService.get(marker('organizations.specialties.numSpecialties'), {
      numItems: item.numSpecialties.toString()
    });
  }

  public editAction(item: DepartmentDTO): void {
    this.buttonCreateEditAction(item);
  }

  public deleteAction(item: DepartmentDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('organizations.departments.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.departmentsService
            .deleteDepartment(item.id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                this.getDepartments();
              },
              error: (error: ConcenetError) => {
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }

  public duplicateAction(item: DepartmentDTO): void {
    const spinner = this.spinnerService.show();
    this.departmentsService
      .duplicateDepartment(item.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.getDepartments();
          }
        },
        error: (error: ConcenetError) => {
          this.logger.error(error);

          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  public showUsersAction(item: DepartmentDTO): void {
    this.router.navigate([`${RouteConstants.ADMINISTRATION}/${RouteConstants.USERS}`], {
      state: { brands: [{ id: this.brandId }], facilities: [{ id: this.facilityId }], departments: [item] }
    });
  }

  private getDepartments(): void {
    const spinner = this.spinnerService.show();
    this.departments$ = this.departmentsService.getDepartmentsByFacilitiesIds([this.facilityId]).pipe(
      take(1),
      tap((data: DepartmentDTO[]) => (this.hasDepartments = data && data.length > 0 ? true : false)),
      finalize(() => this.spinnerService.hide(spinner))
    );
  }
  private openEditCreateModal(deparment?: DepartmentDTO) {
    this.customDialogService
      .open({
        id: CreateEditDepartmentComponentModalEnum.ID,
        panelClass: CreateEditDepartmentComponentModalEnum.PANEL_CLASS,
        component: CreateEditDepartmentComponent,
        extendedComponentData: {
          department: deparment ? deparment : null,
          facilityId: this.facilityId
        },
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.getDepartments();
        }
      });
  }
}
