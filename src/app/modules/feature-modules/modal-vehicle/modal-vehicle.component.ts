import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import VehicleEntityDTO, { TakeAllVehicle, Variants } from '@data/models/entities/vehicle-entity-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import { EntitiesService } from '@data/services/entities.service';
import { FacilityService } from '@data/services/facility.sevice';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';

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
  public isStockVehicle = false;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private entitiesService: EntitiesService,
    private facilityService: FacilityService
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
    this.form.make.enable();
    this.form.make.setValue(null);
    this.form.variantCode.setValue(null);
    this.form.variantCode.disable();
    this.form.model.enable();
    this.form.model.setValue(null);
  }
  public getfacilityList() {
    this.facilityAsyncList = this.facilityService.getFacilitiesByBrandsIds().pipe(
      tap({
        next: (facilities: FacilityDTO[]) => {
          const selectedFacility = this.vehicleForm.get('facility').value;
          if (selectedFacility) {
            this.vehicleForm.get('facility').setValue(
              facilities.find((facility: FacilityDTO) => facility.id === selectedFacility.id),
              { emitEvent: false }
            );
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

  searchMakes(event: Event): void {
    if (this.vehicleForm.controls.vin.value && !this.vehicleForm.controls.commissionNumber.value) {
      const input = event.target as HTMLInputElement;
      const value = input.value;
      this.vehicleForm.controls.model.disable();
      this.vehicleForm.controls.make.disable();
      this.entitiesService
        .getMake(value, this.vehicleForm.controls.facility.value.id)
        .pipe(take(1))
        .subscribe((resp: TakeAllVehicle) => {
          this.variants = resp.variants;
          this.vehicleForm.controls.variantCode.enable();
          this.vehicleForm.controls.model.setValue(resp.model);
          this.vehicleForm.controls.make.setValue(resp.make);
        });
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | VehicleEntityDTO> {
    const formValue = this.vehicleForm.getRawValue();
    const body: VehicleEntityDTO = {
      id: formValue.id ? formValue.id : null,
      licensePlate: formValue.licensePlate ? formValue.licensePlate : null,
      vin: formValue.vin ? formValue.vin : null,
      make: formValue.make ? formValue.make : null,
      model: formValue.model ? formValue.model : null,
      description: formValue.description ? formValue.description : null,
      vehicleId: formValue.vehicleId ? formValue.vehicleId : null,
      inventories: []
    };
    if (this.vehicleToEdit && this.vehicleToEdit.inventories && this.vehicleToEdit.inventories.length) {
      body.inventories.push({
        id: this.vehicleToEdit.inventories[this.vehicleToEdit.inventories.length - 1].id,
        commissionNumber: formValue.commissionNumber ? formValue.commissionNumber : null,
        enterpriseId: formValue.facilityStock ? formValue.facilityStock.enterpriseId : null,
        storeId: formValue.facilityStock ? formValue.facilityStock.storeId : null
      });
    } else if (formValue.commissionNumber) {
      body.inventories.push({
        commissionNumber: formValue.commissionNumber ? formValue.commissionNumber : null,
        enterpriseId: formValue.facilityStock ? formValue.facilityStock.enterpriseId : null,
        storeId: formValue.facilityStock ? formValue.facilityStock.storeId : null
      });
    }
    const spinner = this.spinnerService.show();
    return this.entitiesService
      .createVehicle(body, this.vehicleToEdit && this.vehicleToEdit.cardInstanceId ? this.vehicleToEdit.cardInstanceId : null)
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
          disabledFn: () => !this.vehicleForm || !(this.vehicleForm.touched && this.vehicleForm.dirty && this.vehicleForm.valid)
        }
      ]
    };
  }
  private initializeForm = (): void => {
    this.vehicleForm = this.fb.group({
      id: [this.vehicleToEdit ? this.vehicleToEdit.id : null],
      licensePlate: [this.vehicleToEdit ? this.vehicleToEdit.licensePlate : null],
      vin: [this.vehicleToEdit ? this.vehicleToEdit.vin : null],
      make: [this.vehicleToEdit ? this.vehicleToEdit.make : null],
      model: [this.vehicleToEdit ? this.vehicleToEdit.model : null],
      description: [this.vehicleToEdit ? this.vehicleToEdit.description : null],
      vehicleId: [{ value: this.vehicleToEdit ? this.vehicleToEdit.vehicleId : null, disabled: true }],
      facility: [this.vehicleToEdit ? this.vehicleToEdit.facility : null],
      variantCode: [this.vehicleToEdit ? this.vehicleToEdit?.variantCode : null],
      commissionNumber: [null],
      facilityStock: [null]
    });
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
    this.isStockVehicle = true;
  };
}
