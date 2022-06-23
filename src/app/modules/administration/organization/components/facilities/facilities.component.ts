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

  private brandId: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private facilitiesService: FacilityService,
    private customDialogService: CustomDialogService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.brandId = parseInt(this.route.snapshot.paramMap.get('idBrand'), 10);
    this.getFacilities();
  }

  public goTo(facility: FacilityDTO) {
    this.router.navigate(
      [
        `${RouteConstants.ADMINISTRATION}/${RouteConstants.ORGANIZATION}/` +
          `${RouteConstants.BRANDS}/${this.brandId}/` +
          `${RouteConstants.FACILITIES}/${facility.id}/` +
          `${RouteConstants.DEPARTMENTS}`
      ],
      { state: { facility } }
    );
  }

  public buttonCreateEditAction(facility?: FacilityDTO) {
    // this.customDialogService
    //   .open({
    //     id: CreateEditFacilityComponentModalEnum.ID,
    //     panelClass: CreateEditFacilityComponentModalEnum.PANEL_CLASS,
    //     component: CreateEditFacilityComponent,
    //     extendedComponentData: facility ? facility : null,
    //     disableClose: true,
    //     width: '900px'
    //   })
    //   .pipe(take(1))
    //   .subscribe((response) => {
    //     if (response) {
    //       this.globalMessageService.showSuccess({
    //         message: this.translateService.instant(marker('common.successOperation')),
    //         actionText: this.translateService.instant(marker('common.close'))
    //       });
    //       this.getFacilities();
    //     }
    //   });
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
    console.log('delete', item);
  }

  public duplicateAction(item: FacilityDTO): void {
    console.log('duplicate', item);
  }

  public showUsersAction(item: FacilityDTO): void {
    console.log('showUsers', item);
  }


  private getFacilities(): void {
    const spinner = this.spinnerService.show();
    this.facilities$ = this.facilitiesService.getFacilitiesByBrandsIds([this.brandId]).pipe(
      tap((data: FacilityDTO[]) => (this.hasFacilities = data.length > 0 ? true : false)),
      finalize(() => this.spinnerService.hide(spinner))
    );
  }
}
