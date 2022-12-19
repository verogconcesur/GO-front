import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitiesSearcherDialogComponent } from './entities-searcher-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { ModalCustomerModule } from '../modal-customer/modal-customer.module';
import { ModalVehicleModule } from '../modal-vehicle/modal-vehicle.module';

@NgModule({
  declarations: [EntitiesSearcherDialogComponent],
  imports: [CommonModule, SharedModule, ModalCustomerModule, ModalVehicleModule],
  exports: []
})
export class EntitiesSearcherDialogModule {}
