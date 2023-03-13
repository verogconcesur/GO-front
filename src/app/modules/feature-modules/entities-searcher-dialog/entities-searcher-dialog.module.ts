import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitiesSearcherDialogComponent } from './entities-searcher-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { ModalCustomerModule } from '../modal-customer/modal-customer.module';
import { ModalVehicleModule } from '../modal-vehicle/modal-vehicle.module';
import { ModalCustomerExternalApiModule } from '../modal-customer-external-api/modal-customer-external-api.module';
import { ModalVehicleExternalApiModule } from '../modal-vehicle-external-api/modal-vehicle-external-api.module';
import { ModalRepairOrderModule } from '../modal-repair-order/modal-repair-order.module';
import { ModalRepairOrderExternalApiModule } from '../modal-repair-order-external-api/modal-repair-order-external-api.module';

@NgModule({
  declarations: [EntitiesSearcherDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    ModalCustomerModule,
    ModalRepairOrderModule,
    ModalVehicleModule,
    ModalCustomerExternalApiModule,
    ModalVehicleExternalApiModule,
    ModalRepairOrderExternalApiModule
  ],
  exports: []
})
export class EntitiesSearcherDialogModule {}
