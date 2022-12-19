import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCustomerComponent } from './modal-customer.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ModalCustomerComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalCustomerComponent]
})
export class ModalCustomerModule {}
