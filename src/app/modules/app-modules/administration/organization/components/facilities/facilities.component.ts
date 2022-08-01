/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomDialogService } from '@jenga/custom-dialog';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilityDTO from '@data/models/facility-dto';
import { FacilityService } from '@data/services/facility.sevice';
import { Observable } from 'rxjs';
import { finalize, tap, take } from 'rxjs/operators';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { TranslateService } from '@ngx-translate/core';
import {
  CreateEditFacilityComponent,
  CreateEditFacilityComponentModalEnum
} from '../create-edit-facility/create-edit-facility.component';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ConcenetError } from '@app/types/error';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.scss']
})
export class FacilitiesComponent implements OnInit {
  public facilities$: Observable<FacilityDTO[]>;
  public hasFacilities = false;

  public labels = {
    title: marker('organizations.facilities.title'),
    createActionLabel: marker('organizations.facilities.create'),
    noDataToShow: marker('errors.noDataToShow')
  };

  // private brandId: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private facilitiesService: FacilityService,
    private customDialogService: CustomDialogService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {
    // this.brandId = parseInt(this.route.snapshot.paramMap.get('idBrand'), 10);
    this.getFacilities();
  }

  public goTo(facility: FacilityDTO) {
    this.router.navigate(
      [
        `${RouteConstants.ADMINISTRATION}/${RouteConstants.ORGANIZATION}/` +
          // `${RouteConstants.BRANDS}/${this.brandId}/` +
          `${RouteConstants.FACILITIES}/${facility.id}/` +
          `${RouteConstants.DEPARTMENTS}`
      ],
      { state: { facility } }
    );
  }

  public buttonCreateEditAction(facility?: FacilityDTO) {
    if (facility) {
      const spinner = this.spinnerService.show();
      this.facilitiesService
        .getFacilitiesById(facility.id)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe((f: FacilityDTO) => {
          this.openEditCreateModal(f);
        });
    } else {
      this.openEditCreateModal();
    }
  }
  public getSubtitle(item: FacilityDTO): Observable<string> {
    return this.translateService.get(marker('organizations.departments.numDepartments'), {
      numItems: item.numDepartments.toString()
    });
  }

  public editAction(item: FacilityDTO): void {
    this.buttonCreateEditAction(item);
  }

  public deleteAction(item: FacilityDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('organizations.brands.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.facilitiesService
            .deleteFacility(item.id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                this.getFacilities();
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

  public duplicateAction(item: FacilityDTO): void {
    const spinner = this.spinnerService.show();
    this.facilitiesService
      .duplicateFacility(item.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.getFacilities();
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

  public showUsersAction(item: FacilityDTO): void {
    this.router.navigate([`${RouteConstants.ADMINISTRATION}/${RouteConstants.USERS}`], {
      // state: { brands: [{ id: this.brandId }], facilities: [item] }
      state: { facilities: [item] }
    });
  }

  private getFacilities(): void {
    const spinner = this.spinnerService.show();
    this.facilities$ = this.facilitiesService.getFacilitiesByBrandsIds().pipe(
      tap((data: FacilityDTO[]) => (this.hasFacilities = data && data.length > 0 ? true : false)),
      finalize(() => this.spinnerService.hide(spinner))
    );
  }
  private openEditCreateModal(facility?: FacilityDTO) {
    this.customDialogService
      .open({
        id: CreateEditFacilityComponentModalEnum.ID,
        panelClass: CreateEditFacilityComponentModalEnum.PANEL_CLASS,
        component: CreateEditFacilityComponent,
        extendedComponentData: facility ? facility : null,
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
          this.getFacilities();
        }
      });
  }
}
