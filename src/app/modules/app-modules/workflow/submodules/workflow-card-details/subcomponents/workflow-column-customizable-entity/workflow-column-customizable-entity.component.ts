import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import WorkflowCardTabItemDTO from '@data/models/workflows/workflow-card-tab-item-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { finalize, take } from 'rxjs/operators';
// eslint-disable-next-line max-len
import { EntitiesSearcherDialogService } from '@modules/feature-modules/entities-searcher-dialog/entities-searcher-dialog.service';
import { WorkflowPrepareAndMoveService } from '@modules/app-modules/workflow/aux-service/workflow-prepare-and-move-aux.service';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { EntitiesService } from '@data/services/entities.service';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import { CustomDialogService } from '@jenga/custom-dialog';
import {
  CreateEditCustomerComponentModalEnum,
  ModalCustomerComponent
} from '@modules/feature-modules/modal-customer/modal-customer.component';
import {
  CreateEditVehicleComponentModalEnum,
  ModalVehicleComponent
} from '@modules/feature-modules/modal-vehicle/modal-vehicle.component';

@Component({
  selector: 'app-workflow-column-customizable-entity',
  templateUrl: './workflow-column-customizable-entity.component.html',
  styleUrls: ['./workflow-column-customizable-entity.component.scss']
})
export class WorkflowColumnCustomizableEntityComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public workflowId: number;
  public idCard: number;

  public labels = {
    noDataToShow: marker('errors.noDataToShow'),
    changeUser: marker('workflows.changeUser'),
    changeVehicle: marker('workflows.changeVehicle'),
    changeCustomer: marker('workflows.changeCustomer'),
    editVehicle: marker('entities.vehicles.edit'),
    editCustomer: marker('entities.customers.edit'),
    setUser: marker('workflows.setUser'),
    setVehicle: marker('workflows.setVehicle'),
    setCustomer: marker('workflows.setCustomer')
  };

  public entityData: WorkflowCardTabItemDTO[] = [];
  public dataLoaded = false;

  constructor(
    private cardService: CardService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private datePipe: DatePipe,
    private entitySearcher: EntitiesSearcherDialogService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,
    private entitiesService: EntitiesService,
    private customDialogService: CustomDialogService
  ) {}

  ngOnInit(): void {
    this.workflowId = parseInt(this.route.parent.parent.snapshot.params.wId, 10);
    this.idCard = parseInt(this.route?.snapshot?.params?.idCard, 10);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      this.dataLoaded = false;
      this.entityData = [];
      this.getData();
    }
  }

  public showEditEntity(): boolean {
    if (this.tab.permissionType === 'EDIT' && [1, 2].indexOf(this.tab.contentSourceId) >= 0 && this.entityData?.length) {
      return true;
    }
    return false;
  }

  public getEditEntityButtonLabel(): string {
    switch (this.tab.contentSourceId) {
      case 1:
        return this.labels.editCustomer;
      case 2:
        return this.labels.editVehicle;
      default:
        return '';
    }
  }

  public showChangeOrAsignEntity(): boolean {
    if (this.tab.permissionType === 'EDIT' && [1, 2, 3].indexOf(this.tab.contentSourceId) >= 0) {
      return true;
    }
    return false;
  }

  public getChangeOrAsignEntityButtonLabel(): string {
    const prefix = this.entityData?.length ? 'change' : 'set';
    switch (this.tab.contentSourceId) {
      case 1:
        return this.labels[`${prefix}Customer`];
      case 2:
        return this.labels[`${prefix}Vehicle`];
      case 3:
        return this.labels[`${prefix}User`];
      default:
        return '';
    }
  }

  public getData(): void {
    //Cogemos el cardInstanceWorkflowId de la ruta
    if (this.route?.snapshot?.params?.idCard) {
      this.setShowLoading.emit(true);
      this.cardService
        .getCardTabData(parseInt(this.route?.snapshot?.params?.idCard, 10), this.tab.id)
        .pipe(take(1))
        .subscribe(
          (data: WorkflowCardTabItemDTO[]) => {
            this.entityData = data;
            this.dataLoaded = true;
            this.setShowLoading.emit(false);
          },
          (error: ConcenetError) => {
            this.setShowLoading.emit(false);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }

  public getDataValue(data: WorkflowCardTabItemDTO): string | number {
    if (data.tabItemConfigVariable.variable.dataType.toUpperCase() === 'DATE') {
      return this.datePipe.transform(new Date(data.tabItemConfigVariable.variable.value), 'dd-MM-yyyy');
    } else if (data.tabItemConfigVariable.variable.dataType.toUpperCase() === 'DATETIME') {
      return this.datePipe.transform(new Date(data.tabItemConfigVariable.variable.value), 'dd-MM-yyyy, HH:mm');
    } else if (data.tabItemConfigVariable.variable.dataType.toUpperCase() === 'TIME') {
      return this.datePipe.transform(new Date(data.tabItemConfigVariable.variable.value), 'HH:mm');
    }
    return data.tabItemConfigVariable.variable.value;
  }

  public changeEntity(): void {
    let mode: 'USER' | 'CUSTOMER' | 'VEHICLE' = 'USER';
    switch (this.tab.contentSourceId) {
      case 1:
        mode = 'CUSTOMER';
        break;
      case 2:
        mode = 'VEHICLE';
        break;
      case 3:
        mode = 'USER';
        break;
    }
    this.setShowLoading.emit(true);
    this.entitySearcher
      .openEntitySearcher(this.workflowId, mode)
      .then((data) => {
        this.cardService
          .setEntityToTab(this.idCard, this.tab.id, data.id)
          .pipe(take(1))
          .subscribe(
            (resp) => {
              // this.getData();
              // Para que recargue la vista tablero
              this.prepareAndMoveService.reloadData$.next('MOVES_IN_OTHER_WORKFLOWS');
            },
            (error) => {
              this.globalMessageService.showError({
                message: error.message,
                actionText: this.translateService.instant(marker('common.close'))
              });
            }
          );
      })
      .finally(() => this.setShowLoading.emit(false));
  }

  public editEntity(): void {
    this.setShowLoading.emit(true);
    switch (this.tab.contentSourceId) {
      case 1:
        //'CUSTOMER';
        this.entitiesService
          .getCustomer(this.cardInstance.cardInstanceWorkflow.cardInstance.customerId)
          .subscribe((data: CustomerEntityDTO) => {
            this.setShowLoading.emit(false);
            this.customDialogService
              .open({
                id: CreateEditCustomerComponentModalEnum.ID,
                panelClass: CreateEditCustomerComponentModalEnum.PANEL_CLASS,
                component: ModalCustomerComponent,
                extendedComponentData: data ? data : null,
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
                  this.prepareAndMoveService.reloadData$.next('MOVES_IN_OTHER_WORKFLOWS');
                }
              });
          });
        break;
      case 2:
        //'VEHICLE';
        this.entitiesService
          .getVehicle(this.cardInstance.cardInstanceWorkflow.cardInstance.vehicleId)
          .subscribe((data: VehicleEntityDTO) => {
            this.setShowLoading.emit(false);
            this.customDialogService
              .open({
                id: CreateEditVehicleComponentModalEnum.ID,
                panelClass: CreateEditVehicleComponentModalEnum.PANEL_CLASS,
                component: ModalVehicleComponent,
                extendedComponentData: data ? data : null,
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
                  this.prepareAndMoveService.reloadData$.next('MOVES_IN_OTHER_WORKFLOWS');
                }
              });
          });
        break;
    }
  }
}
