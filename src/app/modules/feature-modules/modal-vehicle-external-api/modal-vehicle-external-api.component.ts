import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import VehicleBodyApiDTO from '@data/models/entities/vehicle-body-api-dto';
import VehicleEntityDTO, { InventoryVehicle } from '@data/models/entities/vehicle-entity-dto';
import VehicleFilterDTO, { VehicleInventoryTypes, VehicleStatus } from '@data/models/entities/vehicle-filter-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import { EntitiesService } from '@data/services/entities.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

export const enum CreateEditVehicleExternalApiComponentModalEnum {
  ID = 'create-edit-vehicle-external-api-dialog-id',
  PANEL_CLASS = 'create-edit-external-api-vehicle-dialog',
  TITLE = 'entities.vehicles.import'
}

@Component({
  selector: 'app-modal-vehicle-external-api',
  templateUrl: './modal-vehicle-external-api.component.html',
  styleUrls: ['./modal-vehicle-external-api.component.scss']
})
export class ModalVehicleExternalApiComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('entities.vehicles.import'),
    dataNotFound: marker('newCard.errors.dataNotFound'),
    vehicleNotFound: marker('newCard.errors.vehicleNotFound'),
    licensePlate: marker('entities.vehicles.licensePlate'),
    vehicle: marker('entities.vehicles.vehicle'),
    inventory: marker('entities.vehicles.inventory'),
    selectVehicle: marker('entities.vehicles.select'),
    vin: marker('entities.vehicles.vin'),
    commissionNumber: marker('entities.vehicles.commissionNumber'),
    inventoryType: marker('entities.vehicles.inventoryType'),
    stockId: marker('entities.vehicles.stockId'),
    inventoryVehicleStatus: marker('entities.vehicles.inventoryVehicleStatus'),
    description: marker('entities.vehicles.description'),
    addStock: marker('entities.vehicles.addStock'),
    vehicleId: marker('entities.vehicles.vehicleId'),
    search: marker('common.search'),
    required: marker('errors.required'),
    data: marker('userProfile.data')
  };
  public minLength = 3;
  public facilityId: number;
  public vehicleList: VehicleEntityDTO[] = [];
  public vehicleSelected: VehicleEntityDTO;
  public inventorySelected: InventoryVehicle;
  public vehicleForm: FormGroup;
  public searchForm: FormGroup;
  public inventoryTypes = VehicleInventoryTypes;
  public inventoryStatus = VehicleStatus;
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
      CreateEditVehicleExternalApiComponentModalEnum.ID,
      CreateEditVehicleExternalApiComponentModalEnum.PANEL_CLASS,
      CreateEditVehicleExternalApiComponentModalEnum.TITLE
    );
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.vehicleForm.controls;
  }

  ngOnInit(): void {
    this.facilityId = this.extendedComponentData.facility;
    this.initializeForm();
  }

  ngOnDestroy(): void {}
  public search() {
    if (this.searchForm.valid) {
      const spinner = this.spinnerService.show();
      this.activatedSearch = false;
      this.vehicleForm.get('inventory').setValue(null);
      this.vehicleForm.get('vehicle').setValue(null);
      this.vehicleSelected = null;
      this.inventorySelected = null;
      this.vehicleList = [];
      const searchData = this.searchForm.getRawValue();
      const searchBody: VehicleFilterDTO = {
        facilityId: searchData.facilityId,
        commissionNumber: searchData.commissionNumber ? searchData.commissionNumber : null,
        inventoryType: searchData.inventoryType ? searchData.inventoryType : null,
        inventoryVehicleStatus: searchData.inventoryVehicleStatus ? searchData.inventoryVehicleStatus : null,
        licensePlate: searchData.licensePlate ? searchData.licensePlate : null,
        vin: searchData.vin ? searchData.vin : null
      };
      this.entitiesService
        .searchVehiclesApi(searchBody)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe(
          (res) => {
            this.activatedSearch = true;
            this.vehicleList = res ? res : [];
            if (this.vehicleList.length === 1) {
              this.selectEntity(this.vehicleList[0]);
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
  }
  public removeFilter(formField: string) {
    this.searchForm.get(formField).setValue(null);
  }
  public requiredStockChange(checked: boolean) {
    if (checked) {
      this.searchForm.get('inventoryType').setValue(this.inventoryTypes[0]);
    } else {
      this.searchForm.get('inventoryType').setValue(null);
      this.searchForm.get('commissionNumber').setValue(null);
      this.searchForm.get('inventoryVehicleStatus').setValue(null);
    }
  }
  public changeCommissionNumber(): void {
    if (this.searchForm.get('commissionNumber').value && this.searchForm.get('commissionNumber').value !== '') {
      this.searchForm.get('inventoryVehicleStatus').setValidators([Validators.required]);
      this.searchForm.get('inventoryVehicleStatus').updateValueAndValidity();
    } else {
      this.searchForm.get('inventoryVehicleStatus').setValidators([]);
      this.searchForm.get('inventoryVehicleStatus').updateValueAndValidity();
    }
  }
  public selectEntity(vehicle: VehicleEntityDTO) {
    this.vehicleSelected = vehicle;
    this.vehicleForm.get('vehicle').setValue(vehicle);
    this.vehicleForm.get('inventory').setValue(null);
    if (vehicle.inventories && vehicle.inventories.length > 0) {
      this.vehicleForm.get('inventory').setValidators([Validators.required]);
      this.vehicleForm.get('inventory').updateValueAndValidity();
    } else {
      this.vehicleForm.get('inventory').setValidators([]);
      this.vehicleForm.get('inventory').updateValueAndValidity();
    }
  }
  public selectInventory(inventory: InventoryVehicle) {
    this.inventorySelected = inventory;
  }
  public transformOptionLabel(vehicle: VehicleEntityDTO): string {
    let label = '';
    if (vehicle.licensePlate) {
      label = label + vehicle.licensePlate + '/';
    }
    if (vehicle.vin) {
      label = label + vehicle.vin + '/';
    }
    if (vehicle.vehicleId) {
      label = label + vehicle.vehicleId + '/';
    }
    if (!label && vehicle.description) {
      label = label + vehicle.description + '/';
    }
    return label ? label.slice(0, -1) : this.translateService.instant(marker('entities.vehicles.missInfo'));
  }
  public showError(): boolean {
    return this.vehicleList.length === 0 && this.activatedSearch;
  }
  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.vehicleSelected) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | VehicleEntityDTO> {
    const spinner = this.spinnerService.show();
    const formData = this.vehicleForm.getRawValue();
    const body: VehicleBodyApiDTO = {
      facilityId: formData.facilityId,
      vehicleId: formData.vehicle ? formData.vehicle.vehicleId : null,
      stockId: formData.inventory ? formData.inventory.vehicleStockId : null
    };
    return this.entitiesService.createVehicleApi(body).pipe(
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
          disabledFn: () => !this.vehicleForm.valid
        }
      ]
    };
  }
  private initializeForm = (): void => {
    this.searchForm = this.fb.group({
      facilityId: [this.facilityId],
      requireStock: [false],
      commissionNumber: [''],
      inventoryType: [''],
      inventoryVehicleStatus: [''],
      licensePlate: [''],
      vin: ['']
    });
    this.vehicleForm = this.fb.group({
      facilityId: [this.facilityId],
      inventory: [null],
      vehicle: [null, Validators.required]
    });
  };
}
