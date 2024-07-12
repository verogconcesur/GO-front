import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import RepairOrderEntityDTO from '@data/models/entities/repair-order-entity-dto';
import UserEntityDTO from '@data/models/entities/user-entity-dto';
import VehicleEntityDTO, { InventoryVehicle } from '@data/models/entities/vehicle-entity-dto';
import { CardService } from '@data/services/cards.service';
import { EntitiesService } from '@data/services/entities.service';
import { CustomDialogService } from '@frontend/custom-dialog';
import {
  CreateEditCustomerExternalApiComponentModalEnum,
  ModalCustomerExternalApiComponent
} from '@modules/feature-modules/modal-customer-external-api/modal-customer-external-api.component';
import {
  CreateEditCustomerComponentModalEnum,
  ModalCustomerComponent
} from '@modules/feature-modules/modal-customer/modal-customer.component';
import {
  CreateEditRepairOrderExternalApiComponentModalEnum,
  ModalRepairOrderExternalApiComponent
} from '@modules/feature-modules/modal-repair-order-external-api/modal-repair-order-external-api.component';
import {
  CreateEditRepairOrderComponentModalEnum,
  ModalRepairOrderComponent
} from '@modules/feature-modules/modal-repair-order/modal-repair-order.component';
import {
  CreateEditVehicleExternalApiComponentModalEnum,
  ModalVehicleExternalApiComponent
} from '@modules/feature-modules/modal-vehicle-external-api/modal-vehicle-external-api.component';
import {
  CreateEditVehicleComponentModalEnum,
  ModalVehicleComponent
} from '@modules/feature-modules/modal-vehicle/modal-vehicle.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { take } from 'rxjs/operators';
import { StepColumnService } from '../step-column/step-column.service';

@UntilDestroy()
@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss']
})
export class EntityComponent implements OnInit {
  @Input() formTab: FormGroup;
  @Input() formWorkflow: FormGroup;
  public labels = {
    search: marker('common.search'),
    inventory: marker('entities.vehicles.inventory'),
    createCustomer: marker('entities.customers.create'),
    createVehicle: marker('entities.vehicles.create'),
    createRepairOrder: marker('entities.repairOrders.create'),
    importCustomer: marker('entities.customers.import'),
    importVehicle: marker('entities.vehicles.import'),
    importRepairOrder: marker('entities.repairOrders.import'),
    userNotFound: marker('newCard.errors.userNotFound'),
    vehicleNotFound: marker('newCard.errors.vehicleNotFound'),
    customerNotFound: marker('newCard.errors.customerNotFound'),
    repairOrderNotFound: marker('newCard.errors.repairOrderNotFound'),
    dataNotFound: marker('newCard.errors.dataNotFound'),
    required: marker('errors.required')
  };
  public searchForm: FormGroup;
  public searching = false;
  public entityList: VehicleEntityDTO[] | UserEntityDTO[] | CustomerEntityDTO[] | RepairOrderEntityDTO[] = [];
  public inventoryList: InventoryVehicle[] = [];
  constructor(
    private fb: FormBuilder,
    private cardsService: CardService,
    private entitiesService: EntitiesService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService,
    private steperService: StepColumnService
  ) {}
  get tabItems(): FormArray {
    return this.formTab.get('tabItems') as FormArray;
  }
  public getInventoryLabel(inventory: InventoryVehicle) {
    let returnLabel = '';
    if (inventory.vehicleStockId) {
      returnLabel = inventory.vehicleStockId;
    }
    if (inventory.commissionNumber) {
      returnLabel = returnLabel ? returnLabel + '/' + inventory.commissionNumber : inventory.commissionNumber;
    }
    return returnLabel;
  }
  public showCreateEntity(): boolean {
    if (
      this.formTab.get('contentSourceId').value === 1 ||
      this.formTab.get('contentSourceId').value === 2 ||
      this.formTab.get('contentSourceId').value === 6
    ) {
      return true;
    }
    return false;
  }
  public getCreateEntityButtonLabel(): string {
    switch (this.formTab.get('contentSourceId').value) {
      case 1:
        return this.labels.createCustomer;
      case 2:
        return this.labels.createVehicle;
      case 6:
        return this.labels.createRepairOrder;
      default:
        return '';
    }
  }
  public getImportEntityButtonLabel(): string {
    switch (this.formTab.get('contentSourceId').value) {
      case 1:
        return this.labels.importCustomer;
      case 2:
        return this.labels.importVehicle;
      case 6:
        return this.labels.importRepairOrder;
      default:
        return '';
    }
  }
  public createEntity(importEntity?: boolean) {
    switch (this.formTab.get('contentSourceId').value) {
      case 1:
        if (importEntity) {
          this.customDialogService
            .open({
              id: CreateEditCustomerExternalApiComponentModalEnum.ID,
              panelClass: CreateEditCustomerExternalApiComponentModalEnum.PANEL_CLASS,
              component: ModalCustomerExternalApiComponent,
              disableClose: true,
              extendedComponentData: { facility: this.formWorkflow.controls.facility.value.id },
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
      case 2:
        if (importEntity) {
          this.customDialogService
            .open({
              id: CreateEditVehicleExternalApiComponentModalEnum.ID,
              panelClass: CreateEditVehicleExternalApiComponentModalEnum.PANEL_CLASS,
              component: ModalVehicleExternalApiComponent,
              disableClose: true,
              extendedComponentData: { facility: this.formWorkflow.controls.facility.value.id },
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
      case 6:
        if (importEntity) {
          this.customDialogService
            .open({
              id: CreateEditRepairOrderExternalApiComponentModalEnum.ID,
              panelClass: CreateEditRepairOrderExternalApiComponentModalEnum.PANEL_CLASS,
              component: ModalRepairOrderExternalApiComponent,
              disableClose: true,
              extendedComponentData: { facility: this.formWorkflow.controls.facility.value.id },
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
          if (this.steperService.getCustomerId() && this.steperService.getVehicleId()) {
            this.customDialogService
              .open({
                id: CreateEditRepairOrderComponentModalEnum.ID,
                panelClass: CreateEditRepairOrderComponentModalEnum.PANEL_CLASS,
                component: ModalRepairOrderComponent,
                extendedComponentData: {
                  facility: this.formWorkflow.controls.facility.value.id,
                  vehicle: { id: this.steperService.getVehicleId() },
                  customer: { id: this.steperService.getCustomerId() }
                },
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
          } else {
            this.globalMessageService.showError({
              message: this.translateService.instant(marker('entities.repairOrders.withAouCliAndVeh')),
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        }
        break;
    }
  }
  public searchAction() {
    if (this.searchForm.get('search').value && this.searchForm.get('search').value.length >= 3) {
      this.searching = true;
      switch (this.formTab.get('contentSourceId').value) {
        case 1:
          this.entitiesService
            .searchCustomers(this.searchForm.getRawValue())
            .pipe(take(1))
            .subscribe((res: CustomerEntityDTO[]) => {
              this.entityList = res;
              this.searching = false;
            });
          break;
        case 2:
          this.entitiesService
            .searchVehicles(this.searchForm.getRawValue())
            .pipe(take(1))
            .subscribe((res: VehicleEntityDTO[]) => {
              this.entityList = res;
              this.searching = false;
            });
          break;
        case 3:
          const search = this.searchForm.getRawValue();
          search.workflowId = this.formWorkflow.get('workflow').value.id;
          this.entitiesService
            .searchUsers(search)
            .pipe(take(1))
            .subscribe((res: UserEntityDTO[]) => {
              this.entityList = res;
              this.searching = false;
            });
          break;
        case 6:
          this.entitiesService
            .searchRepairOrders(this.searchForm.getRawValue())
            .pipe(take(1))
            .subscribe((res: RepairOrderEntityDTO[]) => {
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
    this.searchForm.get('search').setValue('');
    this.searching = true;
    const spinner = this.spinnerService.show();
    this.cardsService
      .getEntityCardTabData(this.formWorkflow.get('workflow').value.id, this.formTab.get('id').value, entity.id)
      .pipe(take(1))
      .subscribe((res) => {
        const tabItems = res as unknown as CardColumnTabItemDTO[];
        tabItems.forEach((tabItem) => {
          this.tabItems.controls.forEach((tabItemControl) => {
            if (tabItemControl.get('id').value === tabItem.id) {
              tabItemControl.get('value').setValue(tabItem.tabItemConfigVariable.variable.value);
            }
          });
        });
        switch (this.formTab.get('contentSourceId').value) {
          case 1:
            this.formTab.get('customerId').setValue(entity.id);
            break;
          case 2:
            this.formTab.get('vehicleId').setValue(entity.id);
            this.formTab.get('vehicleInventoryId').setValue(null);
            this.inventoryList = (entity as VehicleEntityDTO).inventories ? (entity as VehicleEntityDTO).inventories : [];
            if (this.inventoryList.length === 1) {
              this.formTab.get('vehicleInventoryId').setValue(this.inventoryList[0].id);
            }
            break;
          case 3:
            this.formTab.get('userId').setValue(entity.id);
            break;
          case 6:
            this.formTab.get('repairOrderId').setValue(entity.id);
            break;
        }
        this.searching = false;
        this.spinnerService.hide(spinner);
      });
  }
  public selectInventory(): void {
    this.searching = true;
    const spinner = this.spinnerService.show();
    this.cardsService
      .getEntityCardTabData(
        this.formWorkflow.get('workflow').value.id,
        this.formTab.get('id').value,
        this.formTab.get('vehicleId').value,
        this.formTab.get('vehicleInventoryId').value
      )
      .pipe(take(1))
      .subscribe((res) => {
        const tabItems = res as unknown as CardColumnTabItemDTO[];
        tabItems.forEach((tabItem) => {
          this.tabItems.controls.forEach((tabItemControl) => {
            if (tabItemControl.get('id').value === tabItem.id) {
              tabItemControl.get('value').setValue(tabItem.tabItemConfigVariable.variable.value);
            }
          });
        });
        this.searching = false;
        this.spinnerService.hide(spinner);
      });
  }

  public removeInventory(): void {
    this.formTab.get('vehicleInventoryId').setValue(null);
    this.searching = true;
    const spinner = this.spinnerService.show();
    this.cardsService
      .getEntityCardTabData(
        this.formWorkflow.get('workflow').value.id,
        this.formTab.get('id').value,
        this.formTab.get('vehicleId').value,
        this.formTab.get('vehicleInventoryId').value
      )
      .pipe(take(1))
      .subscribe((res) => {
        const tabItems = res as unknown as CardColumnTabItemDTO[];
        tabItems.forEach((tabItem) => {
          this.tabItems.controls.forEach((tabItemControl) => {
            if (tabItemControl.get('id').value === tabItem.id) {
              tabItemControl.get('value').setValue(tabItem.tabItemConfigVariable.variable.value);
            }
          });
        });
        this.searching = false;
        this.spinnerService.hide(spinner);
      });
  }
  public showInventory(): boolean {
    return this.formTab.get('contentSourceId').value === 2 && this.inventoryList.length > 0;
  }
  public showContent(): boolean {
    switch (this.formTab.get('contentSourceId').value) {
      case 1:
        if (this.formTab.get('customerId').value) {
          return true;
        } else {
          return false;
        }
      case 2:
        if (this.formTab.get('vehicleId').value) {
          return true;
        } else {
          return false;
        }
      case 3:
        if (this.formTab.get('userId').value) {
          return true;
        } else {
          return false;
        }
      case 6:
        if (this.formTab.get('repairOrderId').value) {
          return true;
        } else {
          return false;
        }
      default:
        return false;
    }
  }
  public transformOptionLabel(entity: CustomerEntityDTO | VehicleEntityDTO | UserEntityDTO | RepairOrderEntityDTO): string {
    switch (this.formTab.get('contentSourceId').value) {
      case 1:
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
      case 2:
        const vehicle = entity as VehicleEntityDTO;
        let textOptionVehicle = vehicle.licensePlate;
        if (vehicle.vin && vehicle.vin.toLowerCase().trim().includes(this.searchForm.get('search').value.toLowerCase().trim())) {
          textOptionVehicle = textOptionVehicle ? textOptionVehicle + '/' + vehicle.vin : vehicle.vin;
        }
        if (!textOptionVehicle && vehicle && vehicle.inventories && vehicle.inventories.length) {
          textOptionVehicle = vehicle.inventories[vehicle.inventories.length - 1].commissionNumber;
        }
        return textOptionVehicle;
      case 3:
        const user = entity as UserEntityDTO;
        let textOptionUser = user.fullName;
        if (user.email && user.email.toLowerCase().trim().includes(this.searchForm.get('search').value.toLowerCase().trim())) {
          textOptionUser = textOptionUser + '/' + user.email;
        }
        return textOptionUser;
      case 6:
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
  public getErrorMsg(): string {
    switch (this.formTab.get('contentSourceId').value) {
      case 1:
        return this.translateService.instant(this.labels.customerNotFound);
      case 2:
        return this.translateService.instant(this.labels.vehicleNotFound);
      case 3:
        return this.translateService.instant(this.labels.userNotFound);
      case 6:
        return this.translateService.instant(this.labels.repairOrderNotFound);
      default:
        return this.translateService.instant(this.labels.dataNotFound);
    }
  }
  public initializeForm(): void {
    this.searchForm = this.fb.group({
      search: ['']
    });
    this.searchForm
      .get('search')
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.searchAction();
      });
  }
  ngOnInit(): void {
    this.initializeForm();
  }
}
