import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CustomerEntityDTO, { BusinessTypes } from '@data/models/entities/customer-entity-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import { CustomersService } from '@data/services/customers.service';
import { EntitiesService } from '@data/services/entities.service';
import { FacilityService } from '@data/services/facility.sevice';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { AtLeastOneRequiredValidator } from '@shared/validators/atLeastOne.validator';
import { Observable, of } from 'rxjs';
import { catchError, finalize, take, tap } from 'rxjs/operators';

export const enum CreateEditCustomerComponentModalEnum {
  ID = 'create-edit-customer-dialog-id',
  PANEL_CLASS = 'create-edit-customer-dialog',
  TITLE = 'entities.customers.create'
}

@Component({
  selector: 'app-modal-customer',
  templateUrl: './modal-customer.component.html',
  styleUrls: ['./modal-customer.component.scss']
})
export class ModalCustomerComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('entities.customers.create'),
    createCustomer: marker('entities.customers.create'),
    editCustomer: marker('entities.customers.edit'),
    contactInfo: marker('entities.customers.contactInfo'),
    gender: marker('entities.customers.gender'),
    communicationPreferredPhone: marker('entities.customers.communicationPreferredPhone'),
    communicationLandline: marker('entities.customers.communicationLandline'),
    communicationWorkMobile: marker('entities.customers.communicationWorkMobile'),
    communicationWorkLandline: marker('entities.customers.communicationWorkLandline'),
    businessInfo: marker('entities.customers.businessInfo'),
    facility: marker('entities.customers.facility'),
    businessTypeCode: marker('entities.customers.businessTypeCode'),
    addressPostalCode: marker('entities.customers.addressPostalCode'),
    name: marker('entities.customers.name'),
    reference: marker('entities.customers.reference'),
    firstName: marker('entities.customers.firstName'),
    lastName: marker('entities.customers.lastName'),
    phone: marker('entities.customers.phone'),
    email: marker('entities.customers.email'),
    socialSecurityId: marker('entities.customers.socialSecurityId'),
    emailError: marker('errors.emailPattern'),
    required: marker('errors.required'),
    data: marker('userProfile.data'),
    notValidPattern: marker('entities.customers.notValidPattern'),
    isCompany: marker('entities.customers.isCompany')
  };
  public facilityAsyncList: Observable<FacilityDTO[]>;
  //@ts-ignore
  public allBusiness: BusinessTypes[];
  public showReference = true;
  public showBusnesType = false;
  public facilityList: FacilityDTO[];
  public phoneList: { value: string; name: string }[];
  public genderList: { value: string; name: string }[];
  public minLength = 3;
  public customerForm: FormGroup;
  public customerToEdit: CustomerEntityDTO;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private confirmationDialog: ConfirmDialogService,
    private customDialogService: CustomDialogService,
    private entitiesService: EntitiesService,
    private facilityService: FacilityService,
    private customerService: CustomersService,
    private authService: AuthenticationService
  ) {
    super(
      CreateEditCustomerComponentModalEnum.ID,
      CreateEditCustomerComponentModalEnum.PANEL_CLASS,
      CreateEditCustomerComponentModalEnum.TITLE
    );
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.customerForm.controls;
  }

  ngOnInit(): void {
    this.customerToEdit = this.extendedComponentData;
    if (this.customerToEdit) {
      this.MODAL_TITLE = this.labels.editCustomer;
    }
    this.initializeForm();
    this.getOptionList();
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.customerForm.touched && this.customerForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | CustomerEntityDTO> {
    return of(true);
  }

  public confirmCreateCustomer = () => {
    const formValue = this.customerForm.value;
    const configList = this.authService.getConfigList();
    const isWriteKeyloopEnabled = configList.includes('WRITE_KEYLOOP');
    if (this.showBusnesType === true && isWriteKeyloopEnabled) {
      this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.customerToEdit
            ? this.translateService.instant(marker('entities.customers.editTitle'))
            : this.translateService.instant(marker('entities.customers.createTitle'))
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            const spinner = this.spinnerService.show();
            this.entitiesService
              .createCustomer({
                id: formValue.id,
                customerId: formValue.customerId,
                reference: formValue.reference,
                name: formValue.name,
                firstName: formValue.firstName,
                secondName: formValue.secondName,
                facility: formValue.facility,
                email: formValue.email,
                isCompany: formValue.isCompany,
                socialSecurityId: formValue.socialSecurityId,
                phone: formValue.phone,
                businessTypeCode: formValue.businessTypeCode.code,
                businessTypeDescription: formValue.businessTypeCode.description,
                addressPostalCode: formValue.addressPostalCode,
                communicationPreferredPhone: formValue.communicationPreferredPhone,
                communicationLandline: formValue.communicationLandline,
                communicationWorkMobile: formValue.communicationWorkMobile,
                communicationWorkLandline: formValue.communicationWorkLandline,
                gender: formValue.gender
              })
              .pipe(
                take(1),
                finalize(() => this.spinnerService.hide(spinner))
              )
              .subscribe({
                next: (response) => {
                  this.customDialogService.close(this.MODAL_ID, response);
                  this.globalMessageService.showSuccess({
                    message: this.translateService.instant(marker('common.successOperation')),
                    actionText: this.translateService.instant(marker('common.close'))
                  });
                  return response;
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
    } else {
      const spinner = this.spinnerService.show();
      this.entitiesService
        .createCustomer({
          id: formValue.id,
          customerId: formValue.customerId,
          reference: formValue.reference,
          name: formValue.name,
          firstName: formValue.firstName,
          secondName: formValue.secondName,
          facility: formValue.facility,
          email: formValue.email,
          isCompany: formValue.isCompany,
          socialSecurityId: formValue.socialSecurityId,
          phone: formValue.phone,
          businessTypeCode: formValue.businessTypeCode.code,
          businessTypeDescription: formValue.businessTypeCode.description,
          addressPostalCode: formValue.addressPostalCode,
          communicationPreferredPhone: formValue.communicationPreferredPhone,
          communicationLandline: formValue.communicationLandline,
          communicationWorkMobile: formValue.communicationWorkMobile,
          communicationWorkLandline: formValue.communicationWorkLandline,
          gender: formValue.gender
        })
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe({
          next: (response) => {
            this.customDialogService.close(this.MODAL_ID, response);
            this.globalMessageService.showSuccess({
              message: this.translateService.instant(marker('common.successOperation')),
              actionText: this.translateService.instant(marker('common.close'))
            });
            return response;
          },
          error: (error) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    }
  };
  public getOptionList() {
    this.facilityAsyncList = this.facilityService.getFacilitiesByBrandsIds().pipe(
      tap({
        next: (facilities: FacilityDTO[]) => {
          this.facilityList = facilities;
          this.isAutoline(true);
          const selectedFacility = this.customerForm.get('facility').value;
          if (selectedFacility) {
            this.customerForm.get('facility').setValue(
              facilities.find((facility: FacilityDTO) => facility.id === selectedFacility.id),
              { emitEvent: false }
            );
          }
        }
      })
    );
    this.phoneList = this.customerService.typePhoneComunications;
    this.genderList = this.customerService.genderTypes;
  }

  public getBusinessTypes() {
    if (this.form.facility.value) {
      this.customerService
        .getAllBusinessTypes(this.form.facility.value.id)
        .pipe(
          take(1),
          catchError((error) => {
            this.globalMessageService.showError({
              message: error.error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            return of([]);
          })
        )
        .subscribe((allBusiness: BusinessTypes[]) => {
          this.allBusiness = allBusiness;
          const selectedBusiness = this.customerForm.get('businessTypeCode').value;
          if (selectedBusiness) {
            this.customerForm.get('businessTypeCode').setValue(
              allBusiness.find((business: BusinessTypes) => business.code === selectedBusiness),
              { emitEvent: false }
            );
          }
        });
    }
  }
  public isAutoline(firstLoad: boolean) {
    const configList = this.authService.getConfigList();
    const isWriteKeyloopEnabled = configList.includes('WRITE_KEYLOOP');
    const facilitySelected = this.facilityList.find((facility) => facility?.id === this.form.facility?.value?.id);
    if (facilitySelected) {
      if (facilitySelected.configApiExtDmsType === 'AUTOLINE') {
        this.showReference = false;
        this.showBusnesType = true;
        if (!firstLoad) {
          this.customerForm.get('reference').setValue(null);
        }
        this.customerForm.get('reference').disable();
        this.customerForm.get('businessTypeCode').enable();
        this.customerForm.get('businessTypeCode').addValidators(Validators.required);
        this.getBusinessTypes();
      } else {
        this.showReference = true;
        this.showBusnesType = false;
        this.customerForm.get('businessTypeCode').clearValidators();
        if (!firstLoad) {
          this.customerForm.get('businessTypeCode').setValue(null);
        }
        this.customerForm.get('businessTypeCode').disable();
        this.customerForm.get('reference').enable();
      }
    } else {
      if (!isWriteKeyloopEnabled) {
        this.customerForm.get('reference').enable();
      }
    }
  }
  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'custom',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          clickFn: this.confirmCreateCustomer,
          disabledFn: () => !(this.customerForm.touched && this.customerForm.dirty && this.customerForm.valid)
        }
      ]
    };
  }
  private initializeForm = (): void => {
    const configList = this.authService.getConfigList();
    const isWriteKeyloopEnabled = configList.includes('WRITE_KEYLOOP');
    this.customerForm = this.fb.group(
      {
        id: [this.customerToEdit ? this.customerToEdit.id : null],
        customerId: [this.customerToEdit ? this.customerToEdit.customerId : null],
        reference: [{ value: this.customerToEdit ? this.customerToEdit.reference : null, disabled: isWriteKeyloopEnabled }],
        //Deshabilitar referencia cliente
        // reference: [{ value: this.customerToEdit ? this.customerToEdit.reference : null, disabled: true }],
        name: [this.customerToEdit ? this.customerToEdit.name : null],
        firstName: [this.customerToEdit ? this.customerToEdit.firstName : null],
        secondName: [this.customerToEdit ? this.customerToEdit.secondName : null],
        facility: [this.customerToEdit ? this.customerToEdit.facility : null, [Validators.required]],
        email: [this.customerToEdit ? this.customerToEdit.email : null, [Validators.email, Validators.required]],
        socialSecurityId: [
          this.customerToEdit ? this.customerToEdit.socialSecurityId : null,
          [Validators.required, Validators.pattern(/^[A-Za-z0-9]*$/)]
        ],
        phone: [this.customerToEdit ? this.customerToEdit.phone : null, [Validators.required]],
        businessTypeCode: [{ value: this.customerToEdit ? this.customerToEdit.businessTypeCode : null, disabled: true }],
        addressPostalCode: [this.customerToEdit ? this.customerToEdit.addressPostalCode : null, [Validators.required]],
        communicationPreferredPhone: [
          this.customerToEdit ? this.customerToEdit.communicationPreferredPhone : null,
          [Validators.required]
        ],
        isCompany: [this.customerToEdit ? this.customerToEdit.isCompany : false],
        communicationLandline: [this.customerToEdit ? this.customerToEdit.communicationLandline : null],
        communicationWorkMobile: [this.customerToEdit ? this.customerToEdit.communicationWorkMobile : null],
        communicationWorkLandline: [this.customerToEdit ? this.customerToEdit.communicationWorkLandline : null],
        gender: [this.customerToEdit ? this.customerToEdit.gender : null, [Validators.required]]
      },
      {
        validators: AtLeastOneRequiredValidator.validate([
          'communicationLandline',
          'communicationWorkMobile',
          'communicationWorkLandline',
          'phone'
        ])
      }
    );
    this.customerForm.controls.facility.valueChanges.pipe(untilDestroyed(this)).subscribe((x) => {
      this.isAutoline(false);
      this.form.businessTypeCode.setValue(null);
    });
  };
}
