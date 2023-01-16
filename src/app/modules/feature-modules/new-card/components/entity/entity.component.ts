import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import UserEntityDTO from '@data/models/entities/user-entity-dto';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import { CardService } from '@data/services/cards.service';
import { EntitiesService } from '@data/services/entities.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import {
  CreateEditCustomerComponentModalEnum,
  ModalCustomerComponent
} from '@modules/feature-modules/modal-customer/modal-customer.component';
import {
  CreateEditVehicleComponentModalEnum,
  ModalVehicleComponent
} from '@modules/feature-modules/modal-vehicle/modal-vehicle.component';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { take } from 'rxjs/operators';

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
    createCustomer: marker('entities.customers.create'),
    createVehicle: marker('entities.vehicles.create'),
    userNotFound: marker('newCard.errors.userNotFound'),
    vehicleNotFound: marker('newCard.errors.vehicleNotFound'),
    customerNotFound: marker('newCard.errors.customerNotFound'),
    dataNotFound: marker('newCard.errors.dataNotFound'),
    required: marker('errors.required')
  };
  public searchForm: FormGroup;
  public searching = false;
  public entityList: VehicleEntityDTO[] | UserEntityDTO[] | CustomerEntityDTO[] = [];
  constructor(
    private fb: FormBuilder,
    private cardsService: CardService,
    private entitiesService: EntitiesService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService
  ) {}
  get tabItems(): FormArray {
    return this.formTab.get('tabItems') as FormArray;
  }

  public showCreateEntity(): boolean {
    if (this.formTab.get('contentSourceId').value === 1 || this.formTab.get('contentSourceId').value === 2) {
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
      default:
        return '';
    }
  }
  public createEntity() {
    switch (this.formTab.get('contentSourceId').value) {
      case 1:
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
        break;
      case 2:
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
        break;
    }
  }
  public searchAction() {
    if (this.searchForm.get('search').value && this.searchForm.get('search').value.length >= 3) {
      this.searching = true;
      switch (this.formTab.get('contentSourceId').value) {
        case 1:
          this.entitiesService.searchCustomers(this.searchForm.getRawValue()).subscribe((res: CustomerEntityDTO[]) => {
            this.entityList = res;
            this.searching = false;
          });
          break;
        case 2:
          this.entitiesService.searchVehicles(this.searchForm.getRawValue()).subscribe((res: VehicleEntityDTO[]) => {
            this.entityList = res;
            this.searching = false;
          });
          break;
        case 3:
          const search = this.searchForm.getRawValue();
          search.workflowId = this.formWorkflow.get('workflow').value.id;
          this.entitiesService.searchUsers(search).subscribe((res: UserEntityDTO[]) => {
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
    const entity: VehicleEntityDTO | UserEntityDTO | CustomerEntityDTO = this.searchForm.get('search').value;
    this.searchForm.get('search').setValue('');
    this.searching = true;
    const spinner = this.spinnerService.show();
    this.cardsService
      .getEntityCardTabData(this.formWorkflow.get('workflow').value.id, this.formTab.get('id').value, entity.id)
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
            break;
          case 3:
            this.formTab.get('userId').setValue(entity.id);
            break;
        }
        this.searching = false;
        this.spinnerService.hide(spinner);
      });
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
      default:
        return false;
    }
  }
  public transformOptionLabel(entity: CustomerEntityDTO | VehicleEntityDTO | UserEntityDTO): string {
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
          textOptionVehicle = textOptionVehicle + '/' + vehicle.vin;
        }
        return textOptionVehicle;
      case 3:
        const user = entity as UserEntityDTO;
        let textOptionUser = user.fullName;
        if (user.email && user.email.toLowerCase().trim().includes(this.searchForm.get('search').value.toLowerCase().trim())) {
          textOptionUser = textOptionUser + '/' + user.email;
        }
        return textOptionUser;
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
      default:
        return this.translateService.instant(this.labels.dataNotFound);
    }
  }
  public initializeForm(): void {
    this.searchForm = this.fb.group({
      search: ['']
    });
    this.searchForm.get('search').valueChanges.subscribe((res) => {
      this.searchAction();
    });
  }
  ngOnInit(): void {
    this.initializeForm();
  }
}
