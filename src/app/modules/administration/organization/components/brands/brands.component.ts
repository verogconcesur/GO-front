/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import BrandDTO from '@data/models/brand-dto';
import { BrandService } from '@data/services/brand.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable } from 'rxjs';
import { finalize, map, tap, take } from 'rxjs/operators';
import { CreateEditBrandComponent, CreateEditBrandComponentModalEnum } from '../create-edit-brand/create-edit-brand.component';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
  public brands$: Observable<BrandDTO[]>;
  public hasBrands = false;
  public labels = {
    title: marker('organizations.brands.title'),
    createActionLabel: marker('organizations.brands.create'),
    noDataToShow: marker('errors.noDataToShow')
  };

  constructor(
    private router: Router,
    private brandsService: BrandService,
    private spinnerService: ProgressSpinnerDialogService,
    private translateService: TranslateService,
    private customDialogService: CustomDialogService,
    private globalMessageService: GlobalMessageService
  ) {}

  ngOnInit(): void {
    this.getBrands();
  }

  public goTo(brand: BrandDTO) {
    this.router.navigate(
      [
        `${RouteConstants.ADMINISTRATION}/${RouteConstants.ORGANIZATION}/${RouteConstants.BRANDS}/${brand.id}/${RouteConstants.FACILITIES}`
      ],
      { state: { brand } }
    );
  }

  public buttonCreateEditAction(brand?: BrandDTO) {
    this.customDialogService
      .open({
        id: CreateEditBrandComponentModalEnum.ID,
        panelClass: CreateEditBrandComponentModalEnum.PANEL_CLASS,
        component: CreateEditBrandComponent,
        extendedComponentData: brand ? brand : null,
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
          this.getBrands();
        }
      });
  }

  public getSubtitle(item: BrandDTO): Observable<string> {
    return this.translateService.get(marker('organizations.facilities.numFacilities'), {
      numItems: item.numFacilities.toString()
    });
  }

  public editAction(item: BrandDTO): void {
    this.buttonCreateEditAction(item);
  }

  public deleteAction(item: BrandDTO): void {
    console.log('delete', item);
  }

  public duplicateAction(item: BrandDTO): void {
    console.log('duplicate', item);
  }

  public showUsersAction(item: BrandDTO): void {
    console.log('showUsers', item);
  }

  public getLogo(item: BrandDTO): string | null {
    if (item.logo && item.logoContentType) {
      return `data:${item.logoContentType};base64,${item.logo}`;
    }
    return null;
  }

  private getBrands(): void {
    const spinner = this.spinnerService.show();
    this.brands$ = this.brandsService.getAllBrandsList().pipe(
      tap((data: BrandDTO[]) => (this.hasBrands = data.length > 0 ? true : false)),
      finalize(() => this.spinnerService.hide(spinner))
    );
  }
}
