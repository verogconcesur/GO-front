import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import RepairOrderEntityDTO from '@data/models/entities/repair-order-entity-dto';
import UserEntityDTO from '@data/models/entities/user-entity-dto';
import VehicleEntityDTO, { InventoryVehicle } from '@data/models/entities/vehicle-entity-dto';
import { EntitiesService } from '@data/services/entities.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';
import {
  CreateEditCustomerExternalApiComponentModalEnum,
  ModalCustomerExternalApiComponent
} from '../modal-customer-external-api/modal-customer-external-api.component';
import { CreateEditCustomerComponentModalEnum, ModalCustomerComponent } from '../modal-customer/modal-customer.component';
import {
  CreateEditRepairOrderExternalApiComponentModalEnum,
  ModalRepairOrderExternalApiComponent
} from '../modal-repair-order-external-api/modal-repair-order-external-api.component';
import {
  CreateEditRepairOrderComponentModalEnum,
  ModalRepairOrderComponent
} from '../modal-repair-order/modal-repair-order.component';
import {
  CreateEditVehicleExternalApiComponentModalEnum,
  ModalVehicleExternalApiComponent
} from '../modal-vehicle-external-api/modal-vehicle-external-api.component';
import { CreateEditVehicleComponentModalEnum, ModalVehicleComponent } from '../modal-vehicle/modal-vehicle.component';

@Component({
  selector: 'app-entities-searcher-dialog',
  templateUrl: './entities-searcher-dialog.component.html',
  styleUrls: ['./entities-searcher-dialog.component.scss']
})
export class EntitiesSearcherDialogComponent implements OnInit {
  public workflowId: number;
  public facilityId: number;
  public mode: 'USER' | 'CUSTOMER' | 'VEHICLE' | 'REPAIRORDER';
  public labels = {
    userSearcher: marker('user.searchDialog'),
    vehicleSearcher: marker('vehicle.searchDialog'),
    customerSearcher: marker('customer.searchDialog'),
    repairOrderSearcher: marker('repairOrder.searchDialog'),
    createCustomer: marker('entities.customers.create'),
    createVehicle: marker('entities.vehicles.create'),
    createRepairOrder: marker('entities.repairOrders.create'),
    importCustomer: marker('entities.customers.import'),
    importVehicle: marker('entities.vehicles.import'),
    importRepairOrder: marker('entities.repairOrders.import'),
    inventory: marker('entities.vehicles.inventory'),
    vehicle: marker('entities.vehicles.vehicle'),
    customer: marker('entities.customers.customer'),
    repairOrder: marker('entities.repairOrders.repairOrder'),
    user: marker('entities.user.user'),
    search: marker('common.search'),
    userNotFound: marker('newCard.errors.userNotFound'),
    vehicleNotFound: marker('newCard.errors.vehicleNotFound'),
    customerNotFound: marker('newCard.errors.customerNotFound'),
    repairOrderNotFound: marker('newCard.errors.repairOrderNotFound'),
    dataNotFound: marker('newCard.errors.dataNotFound'),
    required: marker('errors.required'),
    save: marker('common.save')
  };
  public searchForm: FormGroup;
  public entityForm: FormGroup;
  public searching = false;
  public entityList: VehicleEntityDTO[] | UserEntityDTO[] | CustomerEntityDTO[] | RepairOrderEntityDTO[] = [];
  public inventoryList: InventoryVehicle[] = [];

  constructor(
    private dialogRef: MatDialogRef<EntitiesSearcherDialogComponent>,
    private fb: UntypedFormBuilder,
    private entitiesService: EntitiesService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService,
    @Inject(MAT_DIALOG_DATA)
    public dialogData: { workflowId: number; facilityId: number; mode: 'USER' | 'CUSTOMER' | 'VEHICLE' | 'REPAIRORDER' }
  ) {}

  ngOnInit(): void {
    if (this.dialogData) {
      this.workflowId = this.dialogData.workflowId ? this.dialogData.workflowId : null;
      this.facilityId = this.dialogData.facilityId ? this.dialogData.facilityId : null;
      this.mode = this.dialogData.mode;
    }
    this.initializeForm();
  }

  public close(): void {
    this.dialogRef.close();
  }
  public save(): void {
    this.dialogRef.close(this.entityForm.getRawValue());
  }
  public getTitle(): string {
    switch (this.mode) {
      case 'USER':
        return this.labels.userSearcher;
      case 'CUSTOMER':
        return this.labels.customerSearcher;
      case 'VEHICLE':
        return this.labels.vehicleSearcher;
      case 'REPAIRORDER':
        return this.labels.repairOrderSearcher;
      default:
        return '';
    }
  }
  public showCreateEntity(): boolean {
    if (this.mode === 'CUSTOMER' || this.mode === 'VEHICLE' || this.mode === 'REPAIRORDER') {
      return true;
    }
    return false;
  }
  public getCreateEntityButtonLabel(): string {
    switch (this.mode) {
      case 'CUSTOMER':
        return this.labels.createCustomer;
      case 'VEHICLE':
        return this.labels.createVehicle;
      case 'REPAIRORDER':
        return this.labels.createRepairOrder;
      default:
        return '';
    }
  }
  public getImportEntityButtonLabel(): string {
    switch (this.mode) {
      case 'CUSTOMER':
        return this.labels.importCustomer;
      case 'VEHICLE':
        return this.labels.importVehicle;
      case 'REPAIRORDER':
        return this.labels.importRepairOrder;
      default:
        return '';
    }
  }
  public createEntity(importEntity?: boolean) {
    switch (this.mode) {
      case 'CUSTOMER':
        if (importEntity) {
          this.customDialogService
            .open({
              id: CreateEditCustomerExternalApiComponentModalEnum.ID,
              panelClass: CreateEditCustomerExternalApiComponentModalEnum.PANEL_CLASS,
              component: ModalCustomerExternalApiComponent,
              disableClose: true,
              extendedComponentData: { facility: this.facilityId },
              width: '900px'
            })
            .pipe(take(1))
            .subscribe((response) => {
              if (response) {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.searchForm.get('search').setValue(response);
                this.selectEntity();
              }
            });
        } else {
          this.customDialogService
            .open({
              id: CreateEditCustomerComponentModalEnum.ID,
              panelClass: CreateEditCustomerComponentModalEnum.PANEL_CLASS,
              component: ModalCustomerComponent,
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
                this.searchForm.get('search').setValue(response);
                this.selectEntity();
              }
            });
        }
        break;
      case 'VEHICLE':
        if (importEntity) {
          this.customDialogService
            .open({
              id: CreateEditVehicleExternalApiComponentModalEnum.ID,
              panelClass: CreateEditVehicleExternalApiComponentModalEnum.PANEL_CLASS,
              component: ModalVehicleExternalApiComponent,
              disableClose: true,
              extendedComponentData: { facility: this.facilityId },
              width: '900px'
            })
            .pipe(take(1))
            .subscribe((response) => {
              if (response) {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.searchForm.get('search').setValue(response);
                this.selectEntity();
              }
            });
        } else {
          this.customDialogService
            .open({
              id: CreateEditVehicleComponentModalEnum.ID,
              panelClass: CreateEditVehicleComponentModalEnum.PANEL_CLASS,
              component: ModalVehicleComponent,
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
                this.searchForm.get('search').setValue(response);
                this.selectEntity();
              }
            });
        }
        break;
      case 'REPAIRORDER':
        if (importEntity) {
          this.customDialogService
            .open({
              id: CreateEditRepairOrderExternalApiComponentModalEnum.ID,
              panelClass: CreateEditRepairOrderExternalApiComponentModalEnum.PANEL_CLASS,
              component: ModalRepairOrderExternalApiComponent,
              disableClose: true,
              extendedComponentData: { facility: this.facilityId },
              width: '900px'
            })
            .pipe(take(1))
            .subscribe((response) => {
              if (response) {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.searchForm.get('search').setValue(response);
                this.selectEntity();
              }
            });
        } else {
          this.customDialogService
            .open({
              id: CreateEditRepairOrderComponentModalEnum.ID,
              panelClass: CreateEditRepairOrderComponentModalEnum.PANEL_CLASS,
              component: ModalRepairOrderComponent,
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
                this.searchForm.get('search').setValue(response);
                this.selectEntity();
              }
            });
        }
        break;
    }
  }

  public searchAction() {
    if (this.searchForm.get('search').value && this.searchForm.get('search').value.length >= 3) {
      this.searching = true;
      switch (this.mode) {
        case 'CUSTOMER':
          this.entitiesService.searchCustomers(this.searchForm.getRawValue()).subscribe((res: CustomerEntityDTO[]) => {
            this.entityList = res;
            this.searching = false;
          });
          break;
        case 'VEHICLE':
          this.entitiesService.searchVehicles(this.searchForm.getRawValue()).subscribe((res: VehicleEntityDTO[]) => {
            this.entityList = res;
            this.searching = false;
          });
          break;
        case 'USER':
          const search = this.searchForm.getRawValue();
          search.workflowId = this.workflowId;
          this.entitiesService.searchUsers(search).subscribe((res: UserEntityDTO[]) => {
            this.entityList = res;
            this.searching = false;
          });
          break;
        case 'REPAIRORDER':
          this.entitiesService.searchRepairOrders(this.searchForm.getRawValue()).subscribe((res: RepairOrderEntityDTO[]) => {
            this.entityList = res;
            this.searching = false;
          });
          break;
        default:
          this.entityList = [];
          this.searching = false;
          break;
      }
    } else {
      this.entityList = [];
    }
  }

  public selectEntity(): void {
    const entity: VehicleEntityDTO | UserEntityDTO | CustomerEntityDTO | RepairOrderEntityDTO =
      this.searchForm.get('search').value;
    this.entityForm.get('entity').setValue(entity);
    this.entityForm.get('vehicleInventoryId').setValue(null);
    if (this.mode === 'VEHICLE') {
      this.inventoryList = (entity as VehicleEntityDTO).inventories ? (entity as VehicleEntityDTO).inventories : [];
    }
    this.searchForm.get('search').setValue('');
  }

  public transformOptionLabel(entity: CustomerEntityDTO | VehicleEntityDTO | UserEntityDTO): string {
    switch (this.mode) {
      case 'CUSTOMER':
        const customer = entity as CustomerEntityDTO;
        let textOptionCustomer = customer.fullName;
        if (
          customer.email &&
          customer.email.toLowerCase().trim().includes(this.searchForm.get('search').value.toLowerCase().trim())
        ) {
          textOptionCustomer = textOptionCustomer + '/' + customer.email;
        }
        if (
          customer.phone &&
          customer.phone.toLowerCase().trim().includes(this.searchForm.get('search').value.toLowerCase().trim())
        ) {
          textOptionCustomer = textOptionCustomer + '/' + customer.phone;
        }
        return textOptionCustomer;
      case 'VEHICLE':
        const vehicle = entity as VehicleEntityDTO;
        let textOptionVehicle = vehicle.licensePlate;
        if (vehicle.vin && vehicle.vin.toLowerCase().trim().includes(this.searchForm.get('search').value.toLowerCase().trim())) {
          textOptionVehicle = textOptionVehicle + '/' + vehicle.vin;
        }
        return textOptionVehicle;
      case 'USER':
        const user = entity as UserEntityDTO;
        let textOptionUser = user.fullName;
        if (user.email && user.email.toLowerCase().trim().includes(this.searchForm.get('search').value.toLowerCase().trim())) {
          textOptionUser = textOptionUser + '/' + user.email;
        }
        return textOptionUser;
      case 'REPAIRORDER':
        const repairOrder = entity as RepairOrderEntityDTO;
        return repairOrder.reference;
    }
  }

  public showError(): boolean {
    return (
      this.searchForm.get('search').value &&
      this.searchForm.get('search').value.length >= 3 &&
      (!this.entityList || this.entityList.length === 0) &&
      !this.searching
    );
  }

  public showInventory(): boolean {
    return this.mode === 'VEHICLE' && this.inventoryList.length > 0;
  }
  public removeInventory(): void {
    this.entityForm.get('vehicleInventoryId').setValue(null);
  }
  public getLabel(): string {
    switch (this.mode) {
      case 'CUSTOMER':
        return this.translateService.instant(this.labels.customer);
      case 'VEHICLE':
        return this.translateService.instant(this.labels.vehicle);
      case 'USER':
        return this.translateService.instant(this.labels.user);
      case 'REPAIRORDER':
        return this.translateService.instant(this.labels.repairOrder);
      default:
        return this.translateService.instant(this.labels.user);
    }
  }
  public getEntityValue(): string {
    const entity = this.entityForm.get('entity').value;
    return this.transformOptionLabel(entity);
  }
  public getErrorMsg(): string {
    switch (this.mode) {
      case 'CUSTOMER':
        return this.translateService.instant(this.labels.customerNotFound);
      case 'VEHICLE':
        return this.translateService.instant(this.labels.vehicleNotFound);
      case 'USER':
        return this.translateService.instant(this.labels.userNotFound);
      case 'REPAIRORDER':
        return this.translateService.instant(this.labels.repairOrderNotFound);
      default:
        return this.translateService.instant(this.labels.dataNotFound);
    }
  }

  public initializeForm(): void {
    this.searchForm = this.fb.group({
      search: ['']
    });
    this.entityForm = this.fb.group({
      entity: [null, Validators.required],
      vehicleInventoryId: [null]
    });
    this.searchForm.get('search').valueChanges.subscribe((res) => {
      this.searchAction();
    });
  }
}
