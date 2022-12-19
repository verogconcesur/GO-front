import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import BrandDTO from '@data/models/organization/brand-dto';
import { EntitiesService } from '@data/services/entities.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

export const enum CreateEditVehicleComponentModalEnum {
  ID = 'create-edit-vehicle-dialog-id',
  PANEL_CLASS = 'create-edit-vehicle-dialog',
  TITLE = 'entities.vehicle.create'
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
    chasis: marker('entities.vehicles.chasis'),
    data: marker('userProfile.data')
  };
  public minLength = 3;
  public vehicleForm: FormGroup;
  public vehicleToEdit: VehicleEntityDTO;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private entitiesService: EntitiesService
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
    this.initializeForm();
  }

  ngOnDestroy(): void {}

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

  public onSubmitCustomDialog(): Observable<boolean | BrandDTO> {
    const formValue = this.vehicleForm.value;
    const spinner = this.spinnerService.show();
    return this.entitiesService.createVehicle(formValue).pipe(
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
          disabledFn: () => !(this.vehicleForm.touched && this.vehicleForm.dirty && this.vehicleForm.valid)
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
      chasis: [this.vehicleToEdit ? this.vehicleToEdit.chasis : null]
    });
  };
}
