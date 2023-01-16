import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import UserEntityDTO from '@data/models/entities/user-entity-dto';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import { EntitiesService } from '@data/services/entities.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';
import { CreateEditCustomerComponentModalEnum, ModalCustomerComponent } from '../modal-customer/modal-customer.component';
import { CreateEditVehicleComponentModalEnum, ModalVehicleComponent } from '../modal-vehicle/modal-vehicle.component';

@Component({
  selector: 'app-entities-searcher-dialog',
  templateUrl: './entities-searcher-dialog.component.html',
  styleUrls: ['./entities-searcher-dialog.component.scss']
})
export class EntitiesSearcherDialogComponent implements OnInit {
  public workflowId: number;
  public mode: 'USER' | 'CUSTOMER' | 'VEHICLE';
  public labels = {
    userSearcher: marker('user.searchDialog'),
    vehicleSearcher: marker('vehicle.searchDialog'),
    customerSearcher: marker('customer.searchDialog'),
    createCustomer: marker('entities.customers.create'),
    createVehicle: marker('entities.vehicles.create'),
    search: marker('common.search'),
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
    private dialogRef: MatDialogRef<EntitiesSearcherDialogComponent>,
    private fb: UntypedFormBuilder,
    private entitiesService: EntitiesService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService,
    @Inject(MAT_DIALOG_DATA) public dialogData: { workflowId: number; mode: 'USER' | 'CUSTOMER' | 'VEHICLE' }
  ) {}

  ngOnInit(): void {
    if (this.dialogData) {
      this.workflowId = this.dialogData.workflowId ? this.dialogData.workflowId : null;
      this.mode = this.dialogData.mode;
    }
    this.initializeForm();
  }

  public close(): void {
    this.dialogRef.close();
  }

  public getTitle(): string {
    switch (this.mode) {
      case 'USER':
        return this.labels.userSearcher;
      case 'CUSTOMER':
        return this.labels.customerSearcher;
      case 'VEHICLE':
        return this.labels.vehicleSearcher;
      default:
        return '';
    }
  }
  public showCreateEntity(): boolean {
    if (this.mode === 'CUSTOMER' || this.mode === 'VEHICLE') {
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
      default:
        return '';
    }
  }
  public createEntity() {
    switch (this.mode) {
      case 'CUSTOMER':
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
      case 'VEHICLE':
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
    this.dialogRef.close(entity);
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
    switch (this.mode) {
      case 'CUSTOMER':
        return this.translateService.instant(this.labels.customerNotFound);
      case 'VEHICLE':
        return this.translateService.instant(this.labels.vehicleNotFound);
      case 'USER':
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
}
