import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalRepairOrderExternalApiComponent } from './modal-repair-order-external-api.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ModalRepairOrderExternalApiComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalRepairOrderExternalApiComponent]
})
export class ModalRepairOrderExternalApiModule {}
