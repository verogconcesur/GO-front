import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import BrandDTO from '@data/models/organization/brand-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import { EntitiesService } from '@data/services/entities.service';
import { FacilityService } from '@data/services/facility.sevice';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

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
    commissionNumber: marker('entities.vehicles.commissionBonus'),
    required: marker('errors.required'),
    minLength: marker('errors.minLength')
  };
  public minLength = 3;
  public vehicleForm: FormGroup;
  public vehicleToEdit: VehicleEntityDTO;
  public facilityList: FacilityDTO[] = [];

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
          this.initializeForm();
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe({
        next: (data) => (this.facilityList = data),
        error: (err: ConcenetError) =>
          this.globalMessageService.showError({
            message: err.message,
            actionText: this.translateService.instant(marker('common.close'))
          })
      });
  }

  ngOnDestroy(): void {}
  public removeFacility(): void {
    this.form.facility.setValue(null);
    this.vehicleForm.markAsTouched();
    this.vehicleForm.markAsDirty();
  }
  public changeCommissionNumber(): void {
    if (this.form.commissionNumber.value && !this.form.facility.hasValidator(Validators.required)) {
      this.form.facility.setValidators([Validators.required, Validators.minLength(this.minLength)]);
      this.form.facility.updateValueAndValidity();
      this.vehicleForm.markAsTouched();
      this.vehicleForm.markAsDirty();
    } else if (!this.form.commissionNumber.value && this.form.facility.hasValidator(Validators.required)) {
      this.form.facility.setValidators([]);
      this.form.facility.setValue(null);
      this.form.facility.updateValueAndValidity();
      this.vehicleForm.markAsTouched();
      this.vehicleForm.markAsDirty();
    }
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

  public onSubmitCustomDialog(): Observable<boolean | VehicleEntityDTO> {
    const formValue = this.vehicleForm.value;
    const body: VehicleEntityDTO = {
      id: formValue.id ? formValue.id : null,
      licensePlate: formValue.licensePlate ? formValue.licensePlate : null,
      vin: formValue.vin ? formValue.vin : null,
      make: formValue.make ? formValue.make : null,
      model: formValue.model ? formValue.model : null,
      description: formValue.description ? formValue.description : null,
      vehicleId: formValue.vehicleId ? formValue.vehicleId : null,
      chassis: formValue.chassis ? formValue.chassis : null,
      inventories: []
    };
    if (this.vehicleToEdit && this.vehicleToEdit.inventories && this.vehicleToEdit.inventories.length) {
      body.inventories.push({
        id: this.vehicleToEdit.inventories[this.vehicleToEdit.inventories.length - 1].id,
        commissionNumber: formValue.commissionNumber ? formValue.commissionNumber : null,
        enterpriseId: formValue.facility ? formValue.facility.enterpriseId : null,
        storeId: formValue.facility ? formValue.facility.storeId : null
      });
    } else if (formValue.commissionNumber) {
      body.inventories.push({
        commissionNumber: formValue.commissionNumber ? formValue.commissionNumber : null,
        enterpriseId: formValue.facility ? formValue.facility.enterpriseId : null,
        storeId: formValue.facility ? formValue.facility.storeId : null
      });
    }
    const spinner = this.spinnerService.show();
    return this.entitiesService.createVehicle(body).pipe(
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
      vehicleId: [this.vehicleToEdit ? this.vehicleToEdit.vehicleId : null],
      chassis: [this.vehicleToEdit ? this.vehicleToEdit.chassis : null],
      commissionNumber: [null],
      facility: [null]
    });
    if (this.vehicleToEdit && this.vehicleToEdit.inventories && this.vehicleToEdit.inventories.length) {
      this.form.commissionNumber.setValue(
        this.vehicleToEdit.inventories[this.vehicleToEdit.inventories.length - 1].commissionNumber
      );
      this.changeCommissionNumber();
      const facility = this.facilityList.find(
        (fac: FacilityDTO) => fac.id === this.vehicleToEdit.inventories[this.vehicleToEdit.inventories.length - 1].facilityId
      );
      this.form.facility.setValue(facility);
    }
  };
}
