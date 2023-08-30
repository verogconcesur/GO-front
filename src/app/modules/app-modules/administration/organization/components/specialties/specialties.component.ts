import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import { SpecialtyService } from '@data/services/specialty.service';
import { CustomDialogService } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap, take, finalize } from 'rxjs/operators';
import {
  CreateEditSpecialtyComponent,
  CreateEditSpecialtyComponentModalEnum
} from '../create-edit-specialty/create-edit-specialty.component';

@Component({
  selector: 'app-specialties',
  templateUrl: './specialties.component.html',
  styleUrls: ['./specialties.component.scss']
})
export class SpecialtiesComponent implements OnInit {
  public specialties$: Observable<SpecialtyDTO[]>;

  public labels = {
    title: marker('organizations.specialties.title'),
    createActionLabel: marker('organizations.specialties.create'),
    noDataToShow: marker('errors.noDataToShow')
  };
  public hasSpecialties = false;
  // private brandId: number;
  private facilityId: number;
  private departmentId: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private specialtyService: SpecialtyService,
    private customDialogService: CustomDialogService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private logger: NGXLogger,
    private confirmationDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    // this.brandId = parseInt(this.route.snapshot.paramMap.get('idBrand'), 10);
    this.facilityId = parseInt(this.route.snapshot.paramMap.get('idFacility'), 10);
    this.departmentId = parseInt(this.route.snapshot.paramMap.get('idDepartment'), 10);
    this.getSpecialties();
  }

  public buttonCreateEditAction(specialty?: SpecialtyDTO) {
    if (specialty) {
      const spinner = this.spinnerService.show();
      this.specialtyService
        .getSpecialtiesById(specialty.id)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe((f: SpecialtyDTO) => {
          this.openEditCreateModal(f);
        });
    } else {
      this.openEditCreateModal();
    }
  }

  public editAction(item: SpecialtyDTO): void {
    this.buttonCreateEditAction(item);
  }

  public deleteAction(item: SpecialtyDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('organizations.specialties.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.specialtyService
            .deleteSpecialty(item.id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                this.getSpecialties();
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

  public duplicateAction(item: SpecialtyDTO): void {
    const spinner = this.spinnerService.show();
    this.specialtyService
      .duplicateSpecialty(item.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.getSpecialties();
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

  public showUsersAction(item: SpecialtyDTO): void {
    this.router.navigate([`${RouteConstants.ADMINISTRATION}/${RouteConstants.USERS}`], {
      state: {
        // brands: [{ id: this.brandId }],
        facilities: [{ id: this.facilityId }],
        departments: [{ id: this.departmentId }],
        specialties: [item]
      }
    });
  }

  private getSpecialties(): void {
    const spinner = this.spinnerService.show();
    this.specialties$ = this.specialtyService.getSpecialtiesByDepartmentIds([this.departmentId]).pipe(
      take(1),
      tap((data: SpecialtyDTO[]) => (this.hasSpecialties = data && data.length > 0 ? true : false)),
      finalize(() => this.spinnerService.hide(spinner))
    );
  }
  private openEditCreateModal(specialty?: SpecialtyDTO) {
    setTimeout(() => {
      this.customDialogService
        .open({
          id: CreateEditSpecialtyComponentModalEnum.ID,
          panelClass: CreateEditSpecialtyComponentModalEnum.PANEL_CLASS,
          component: CreateEditSpecialtyComponent,
          extendedComponentData: {
            specialty: specialty ? specialty : null,
            department: this.departmentId
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
            this.getSpecialties();
          }
        });
    });
  }
}
