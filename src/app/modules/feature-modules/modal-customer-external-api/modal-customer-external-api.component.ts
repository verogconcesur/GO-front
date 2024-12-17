import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CustomerEntityApiDTO from '@data/models/entities/customer-entity-api-dto';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import CustomerFilterDTO from '@data/models/entities/customer-filter-dto';
import { EntitiesService } from '@data/services/entities.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

export const enum CreateEditCustomerExternalApiComponentModalEnum {
  ID = 'create-edit-customer-external-api-dialog-id',
  PANEL_CLASS = 'create-edit-external-api-customer-dialog',
  TITLE = 'entities.customers.import'
}

@Component({
  selector: 'app-modal-customer-external-api',
  templateUrl: './modal-customer-external-api.component.html',
  styleUrls: ['./modal-customer-external-api.component.scss']
})
export class ModalCustomerExternalApiComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('entities.customers.import'),
    name: marker('entities.customers.name'),
    reference: marker('entities.customers.reference'),
    phone: marker('entities.customers.phone'),
    email: marker('entities.customers.email'),
    socialSecurityId: marker('entities.customers.socialSecurityId'),
    search: marker('common.search'),
    dataNotFound: marker('newCard.errors.dataNotFound'),
    customerNotFound: marker('newCard.errors.customerNotFound'),
    minLength: marker('errors.minLength'),
    data: marker('userProfile.data')
  };
  public minLength = 3;
  public facilityId: number;
  public customerList: CustomerEntityApiDTO[] = [];
  public customerSelected: CustomerEntityApiDTO;
  public searchForm: FormGroup;
  public activatedSearch = false;
  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private entitiesService: EntitiesService
  ) {
    super(
      CreateEditCustomerExternalApiComponentModalEnum.ID,
      CreateEditCustomerExternalApiComponentModalEnum.PANEL_CLASS,
      CreateEditCustomerExternalApiComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.facilityId = this.extendedComponentData.facility;
    this.initializeForm();
  }

  ngOnDestroy(): void {}
  public search() {
    const spinner = this.spinnerService.show();
    this.customerSelected = null;
    const searchBody: CustomerFilterDTO = {
      facilityId: this.facilityId,
      socialSecurityId: this.searchForm.getRawValue().search
    };
    this.entitiesService
      .searchCustomersApi(searchBody)
      .pipe(
        take(1),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe(
        (res) => {
          this.customerList = res.map((customer: CustomerEntityApiDTO) => {
            customer.socialSecurityId = searchBody.socialSecurityId;
            return customer;
          });
          this.activatedSearch = true;
          if (this.customerList.length === 1) {
            this.customerSelected = this.customerList[0];
          }
        },
        (error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
  public selectEntity(customer: CustomerEntityApiDTO) {
    this.customerSelected = customer;
    this.searchForm.get('search').setValue(customer.socialSecurityId);
  }
  public transformOptionLabel(customer: CustomerEntityApiDTO) {
    return customer.fullName + '/' + customer.reference;
  }
  public showError(): boolean {
    return this.customerList.length === 0 && this.activatedSearch;
  }
  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.customerSelected) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | CustomerEntityDTO> {
    const spinner = this.spinnerService.show();
    return this.entitiesService
      .createCustomerApi(this.customerSelected.customerId, this.facilityId, this.customerSelected.isCompany)
      .pipe(
        map((response) => {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          return response;
        }),
        catchError((error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          return of(false);
        }),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      );
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.customerSelected
        }
      ]
    };
  }
  private initializeForm = (): void => {
    this.searchForm = this.fb.group({
      search: ['', [Validators.required, Validators.minLength(this.minLength)]]
    });
  };
}
