import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import VehicleEntityDTO, { TakeAllVehicle, Variants } from '@data/models/entities/vehicle-entity-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
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
import { merge, Observable, of } from 'rxjs';
import { catchError, filter, finalize, map, take, tap } from 'rxjs/operators';
import { CustomerVehicles } from '../../../data/models/entities/vehicle-entity-dto';
import { EntitiesSearcherDialogService } from '../entities-searcher-dialog/entities-searcher-dialog.service';

export const enum CreateEditVehicleComponentModalEnum {
  ID = 'create-edit-vehicle-dialog-id',
  PANEL_CLASS = 'create-edit-vehicle-dialog',
  TITLE = 'entities.vehicles.create'
}

@Component({
  selector: 'app-modal-vehicle',
  templateUrl: './modal-vehicle.component.html',
  styleUrls: ['./modal-vehicle.component.scss']
})
export class ModalVehicleComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('entities.vehicles.create'),
    createVehicle: marker('entities.vehicles.create'),
    editVehicle: marker('entities.vehicles.edit'),
    licensePlate: marker('entities.vehicles.licensePlate'),
    vin: marker('entities.vehicles.vin'),
    make: marker('entities.vehicles.make'),
    model: marker('entities.vehicles.model'),
    description: marker('entities.vehicles.description'),
    vehicleId: marker('entities.vehicles.vehicleId'),
    chassis: marker('entities.vehicles.chassis'),
    data: marker('userProfile.data'),
    orderData: marker('entities.vehicles.orderData'),
    facility: marker('entities.vehicles.facility'),
    facilityStock: marker('entities.vehicles.facilityStock'),
    variants: marker('entities.vehicles.variants'),
    commissionNumber: marker('entities.vehicles.commissionBonus'),
    required: marker('errors.required'),
    minLength: marker('errors.minLength')
  };
  public minLength = 3;
  public vehicleForm: FormGroup;
  public vehicleToEdit: VehicleEntityDTO;
  public facilityList: FacilityDTO[] = [];
  public facilityAsyncList: Observable<FacilityDTO[]>;
  public variants: Variants;
  public vehicleCustomersList: CustomerVehicles[] = [];
  public isStockVehicle = false;
  public relationOptions = [
    { value: 'REGISTEREDKEEPER', name: 'Propietario Registrado' },
    { value: 'HOLDER', name: 'Titular' },
    { value: 'DRIVER', name: 'Conductor' },
    { value: 'DEFAULTSERVICEPAYER', name: 'Pagador Predeterminado' }
  ];
  public displayedColumns = ['fullName', 'dni', 'relate', 'actions'];

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private entitiesService: EntitiesService,
    private facilityService: FacilityService,
    private customDialogService: CustomDialogService,
    private entitySearcher: EntitiesSearcherDialogService,
    private cdr: ChangeDetectorRef,
    private authService: AuthenticationService
  ) {
    super(
      CreateEditVehicleComponentModalEnum.ID,
      CreateEditVehicleComponentModalEnum.PANEL_CLASS,
      CreateEditVehicleComponentModalEnum.TITLE
    );
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.vehicleForm.controls;
  }
  get vehicleCustomersArray(): FormArray {
    return this.vehicleForm.get('vehicleCustomers') as FormArray;
  }

  ngOnInit(): void {
    this.vehicleToEdit = this.extendedComponentData;
    if (this.vehicleToEdit) {
      this.MODAL_TITLE = this.labels.editVehicle;
    }
    const spinner = this.spinnerService.show();
    this.facilityService
      .getFacilitiesWithExternalApi()
      .pipe(
        take(1),
        finalize(() => {
          this.spinnerService.hide(spinner);
          this.initializeForm();
        })
      )
      .subscribe({
        next: (data) => {
          this.facilityList = data ? data : [];
        },
        error: (err: ConcenetError) =>
          this.globalMessageService.showError({
            message: err.message,
            actionText: this.translateService.instant(marker('common.close'))
          })
      });
    this.getfacilityList();
  }

  ngOnDestroy(): void {}
  public removeFacility(): void {
    this.form.facilityStock.setValue(null);
    this.vehicleForm.markAsTouched();
    this.vehicleForm.markAsDirty();
  }

  public openModalAddCustomer() {
    this.entitySearcher.openEntitySearcher(null, this.vehicleForm.controls.facility.value, 'CUSTOMER').then((data) => {
      if (data) {
        const newVehicle: CustomerVehicles = {
          id: null,
          vehicleId: this.vehicleForm.controls.id.value,
          customer: data.entity as CustomerEntityDTO,
          relationship: null
        };
        const customerArray = this.vehicleForm.get('vehicleCustomers') as FormArray;

        customerArray.push(this.createCustomerFormGroup(newVehicle));
        this.vehicleCustomersList = [...this.vehicleCustomersList, newVehicle];
      }
    });
  }

  public listenVinFacilityChanges(): void {
    const configList = this.authService.getConfigList();
    const isWriteKeyloopEnabled = configList.includes('WRITE_KEYLOOP');
    if (isWriteKeyloopEnabled) {
      const vinControl = this.vehicleForm.get('vin');
      const facilityControl = this.vehicleForm.get('facility');
      const vinChanges = vinControl?.valueChanges;
      const facilityChanges = facilityControl?.valueChanges;
      if (vinChanges && facilityChanges) {
        merge(vinChanges, facilityChanges)
          .pipe(
            filter(() => {
              const vinValue = vinControl?.value;
              const facilityValue = facilityControl?.value;
              return !!vinValue && !!facilityValue;
            }),
            untilDestroyed(this)
          )
          .subscribe(() => {
            const vinValue = vinControl?.value;
            const facilityValue = facilityControl?.value;
            if (vinValue && facilityValue) {
              this.searchMakes(vinValue, facilityValue.id);
            }
          });
      }
    }
  }
  public changeCommissionNumber(): void {
    if (this.isStockVehicle) {
      this.globalMessageService.showWarning({
        message: this.translateService.instant(marker('entities.vehicles.isStockVehicle')),
        actionText: this.translateService.instant(marker('common.close'))
      });
      this.isStockVehicle = false;
    }
    if (this.form.commissionNumber.value && !this.form.facilityStock.hasValidator(Validators.required)) {
      this.form.facilityStock.setValidators([Validators.required, Validators.minLength(this.minLength)]);
      this.form.facilityStock.updateValueAndValidity();
      this.vehicleForm.markAsTouched();
      this.vehicleForm.markAsDirty();
    } else if (!this.form.commissionNumber.value && this.form.facilityStock.hasValidator(Validators.required)) {
      this.form.facilityStock.setValidators([]);
      this.form.facilityStock.setValue(null);
      this.form.facilityStock.updateValueAndValidity();
      this.vehicleForm.markAsTouched();
      this.vehicleForm.markAsDirty();
    }
    this.form.make.setValue(null);
    this.form.variantCode.setValue(null);
    this.form.variantCode.disable();
    this.form.model.setValue(null);
    this.form.make.enable();
    this.form.model.enable();
    this.cdr.detectChanges();
  }

  public changeVin() {
    if (this.form.vin.value && !this.form.facility.hasValidator(Validators.required)) {
      this.form.facility.setValidators([Validators.required, Validators.minLength(this.minLength)]);
      this.form.facility.updateValueAndValidity();
      this.vehicleForm.markAsTouched();
      this.vehicleForm.markAsDirty();
      this.form.make.disable();
      this.form.model.disable();
    } else if (!this.form.vin.value && this.form.facility.hasValidator(Validators.required)) {
      this.form.facility.setValidators([]);
      this.form.facility.setValue(null);
      this.form.facility.updateValueAndValidity();
      this.vehicleForm.markAsTouched();
      this.vehicleForm.markAsDirty();
      this.form.make.enable();
      this.form.model.enable();
    }
  }
  public openDeleteDialog(index: number) {
    this.confirmDialogService
      .open({
        maxWidth: 500,
        title: this.translateService.instant(marker('advSearch.saveFavOperation.deleteReceiver')),
        message: this.translateService.instant(marker('advSearch.saveFavOperation.deleteReceiverMessage'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.vehicleCustomersList.splice(index, 1);
          this.vehicleCustomersList = [...this.vehicleCustomersList];
          const customerArray = this.vehicleForm.get('vehicleCustomers') as FormArray;
          customerArray.removeAt(index);
        }
      });
  }
  public getfacilityList() {
    this.facilityAsyncList = this.facilityService.getFacilitiesByBrandsIds().pipe(
      take(1),
      tap({
        next: (facilities: FacilityDTO[]) => {
          const selectedFacility = this.vehicleForm.get('facility').value;
          if (selectedFacility) {
            this.vehicleForm.get('facility').setValue(
              facilities.find((facility: FacilityDTO) => facility.id === selectedFacility.id),
              { emitEvent: false }
            );
            this.searchMakes(this.vehicleForm.get('vin').value, selectedFacility.id);
          }
        }
      })
    );
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.vehicleForm.touched && this.vehicleForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  searchMakes(vinValue: string, facilityValue: string): void {
    const configList = this.authService.getConfigList();
    const isWriteKeyloopEnabled = configList.includes('WRITE_KEYLOOP');
    if (isWriteKeyloopEnabled) {
      if (this.vehicleForm.controls.vin.value && !this.vehicleForm.controls.commissionNumber.value) {
        this.form.make.disable();
        this.form.model.disable();
        this.entitiesService
          .getMake(vinValue, Number(facilityValue))
          .pipe(take(1))
          .subscribe((resp: TakeAllVehicle) => {
            this.variants = resp.variants;
            this.vehicleForm.controls.variantCode.enable();
            this.vehicleForm.controls.model.setValue(resp.model);
            this.vehicleForm.controls.make.setValue(resp.make);
            this.vehicleForm.controls.makeCode.setValue(resp.makeCode);
            this.vehicleForm.controls.modelCode.setValue(resp.modelCode);
          });
      }
    }
  }

  public createVehicle = () => {
    const configList = this.authService.getConfigList();
    const isWriteKeyloopEnabled = configList.includes('WRITE_KEYLOOP');
    const formValue = this.vehicleForm.getRawValue();
    const hasComissionNumber = !!formValue.commissionNumber;
    const body: VehicleEntityDTO = {
      id: formValue.id ? formValue.id : null,
      licensePlate: formValue.licensePlate ? formValue.licensePlate : null,
      vin: formValue.vin ? formValue.vin : null,
      description: formValue.description ? formValue.description : null,
      vehicleId: formValue.vehicleId ? formValue.vehicleId : null,
      vehicleCustomers: formValue.vehicleCustomers ? formValue.vehicleCustomers : null,
      inventories: [],
      ...(hasComissionNumber && formValue.model ? { model: formValue.model } : {}),
      ...(hasComissionNumber && formValue.make ? { make: formValue.make } : {}),
      ...(!hasComissionNumber && formValue.facility ? { facility: formValue.facility } : {}),
      ...(!hasComissionNumber && formValue.modelCode ? { modelCode: formValue.modelCode } : {}),
      ...(!hasComissionNumber && formValue.makeCode ? { makeCode: formValue.modelCode } : {}),
      ...(!hasComissionNumber && formValue.variantCode ? { variantCode: formValue.variantCode } : {})
    };
    if (this.vehicleToEdit && this.vehicleToEdit.inventories && this.vehicleToEdit.inventories.length) {
      body.inventories.push({
        id: this.vehicleToEdit.inventories[this.vehicleToEdit.inventories.length - 1].id,
        commissionNumber: formValue.commissionNumber ? formValue.commissionNumber : null,
        enterpriseId: formValue.facility ? formValue.facility.configStockEnterpriseId : null,
        storeId: formValue.facility ? formValue.facility.configStockStoreId : null
      });
    } else if (formValue.commissionNumber) {
      body.inventories.push({
        commissionNumber: formValue.commissionNumber ? formValue.commissionNumber : null,
        enterpriseId: formValue.facility ? formValue.facility.configStockEnterpriseId : null,
        storeId: formValue.facility ? formValue.facility.configStockStoreId : null
      });
    }
    if (formValue.commissionNumber || !isWriteKeyloopEnabled) {
      const spinner = this.spinnerService.show();
      return this.entitiesService
        .createVehicle(body, this.vehicleToEdit && this.vehicleToEdit.cardInstanceId ? this.vehicleToEdit.cardInstanceId : null)
        .pipe(
          take(1),
          map((response) => {
            this.customDialogService.close(this.MODAL_ID, response);
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
        )
        .subscribe();
    } else {
      this.confirmDialogService
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.vehicleToEdit
            ? this.translateService.instant(marker('entities.vehicles.editVehicle'))
            : this.translateService.instant(marker('entities.vehicles.createVehicle'))
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            const spinner = this.spinnerService.show();
            this.entitiesService
              .createVehicle(
                body,
                this.vehicleToEdit && this.vehicleToEdit.cardInstanceId ? this.vehicleToEdit.cardInstanceId : null
              )
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
    }
  };

  public onSubmitCustomDialog(): Observable<boolean | VehicleEntityDTO> {
    return of(true);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onSelectionChange(event: any, element: any, index: number): void {
    const selectedValue = event.value;
    const customerFormGroup = this.vehicleCustomersArray.at(index) as FormGroup;
    customerFormGroup.get('relationship')?.setValue(selectedValue);
    if (this.vehicleCustomersList[index].id === element.id) {
      this.vehicleCustomersList[index].relationship = selectedValue;
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
          clickFn: this.createVehicle,
          disabledFn: () => !this.vehicleForm || !(this.vehicleForm.touched && this.vehicleForm.dirty && this.vehicleForm.valid)
        }
      ]
    };
  }
  private initializeForm = (): void => {
    const configList = this.authService.getConfigList();
    const isWriteKeyloopEnabled = configList.includes('WRITE_KEYLOOP');
    this.vehicleForm = this.fb.group({
      id: [this.vehicleToEdit ? this.vehicleToEdit.id : null],
      licensePlate: [this.vehicleToEdit ? this.vehicleToEdit.licensePlate : null],
      vin: [this.vehicleToEdit ? this.vehicleToEdit.vin : null],
      make: [this.vehicleToEdit ? this.vehicleToEdit.make : null],
      model: [this.vehicleToEdit ? this.vehicleToEdit.model : null],
      description: [this.vehicleToEdit ? this.vehicleToEdit.description : null],
      vehicleId: [this.vehicleToEdit ? this.vehicleToEdit.vehicleId : null],
      facility: [this.vehicleToEdit ? this.vehicleToEdit.facility : null],
      variantCode: [{ value: this.vehicleToEdit ? this.vehicleToEdit?.variantCode : null, disabled: !isWriteKeyloopEnabled }],
      vehicleCustomers: this.fb.array([]),
      commissionNumber: [null],
      facilityStock: [null],
      makeCode: [null],
      modelCode: [null]
    });
    if (this.vehicleToEdit?.vehicleCustomers?.length) {
      this.setVehicleCustomers(this.vehicleToEdit.vehicleCustomers);
    }
    if (this.vehicleToEdit && this.vehicleToEdit.inventories && this.vehicleToEdit.inventories.length) {
      this.form.commissionNumber.setValue(
        this.vehicleToEdit.inventories[this.vehicleToEdit.inventories.length - 1].commissionNumber
      );
      this.changeCommissionNumber();
      const facility = this.facilityList.find(
        (fac: FacilityDTO) => fac.id === this.vehicleToEdit.inventories[this.vehicleToEdit.inventories.length - 1].facilityId
      );
      this.form.facilityStock.setValue(facility);
    }
    this.listenVinFacilityChanges();
    this.isStockVehicle = true;
  };

  private setVehicleCustomers(customers: CustomerVehicles[]): void {
    const customerArray = this.vehicleForm.get('vehicleCustomers') as FormArray;
    this.vehicleCustomersList = [...customers];
    customers.forEach((customer: CustomerVehicles) => {
      customerArray.push(this.createCustomerFormGroup(customer));
    });
  }

  private createCustomerFormGroup(customer: CustomerVehicles): FormGroup {
    return this.fb.group({
      id: [customer.id],
      vehicleId: [customer.vehicleId],
      customer: [customer.customer],
      relationship: [customer.relationship]
    });
  }
}
