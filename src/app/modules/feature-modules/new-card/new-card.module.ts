import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewCardComponent } from './new-card.component';
import { SharedModule } from '@shared/shared.module';
import { StepWorkflowComponent } from './components/step-workflow/step-workflow.component';
import { StepColumnComponent } from './components/step-column/step-column.component';
import { EntityComponent } from './components/entity/entity.component';
import { InformationComponent } from './components/information/information.component';
import { ModalCustomerModule } from '../modal-customer/modal-customer.module';
import { ModalVehicleModule } from '../modal-vehicle/modal-vehicle.module';
import { ModalCustomerExternalApiModule } from '../modal-customer-external-api/modal-customer-external-api.module';
import { ModalVehicleExternalApiModule } from '../modal-vehicle-external-api/modal-vehicle-external-api.module';
import { ModalRepairOrderModule } from '../modal-repair-order/modal-repair-order.module';
import { ModalRepairOrderExternalApiModule } from '../modal-repair-order-external-api/modal-repair-order-external-api.module';

@NgModule({
  declarations: [NewCardComponent, StepWorkflowComponent, StepColumnComponent, EntityComponent, InformationComponent],
  imports: [
    CommonModule,
    SharedModule,
    ModalCustomerModule,
    ModalVehicleModule,
    ModalRepairOrderModule,
    ModalCustomerExternalApiModule,
    ModalVehicleExternalApiModule,
    ModalRepairOrderExternalApiModule
  ],
  exports: [NewCardComponent]
})
export class NewCardModule {}
