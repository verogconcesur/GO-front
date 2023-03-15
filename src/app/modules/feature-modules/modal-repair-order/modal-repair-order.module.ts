import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalRepairOrderComponent } from './modal-repair-order.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ModalRepairOrderComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalRepairOrderComponent]
})
export class ModalRepairOrderModule {}
