import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCustomerExternalApiComponent } from './modal-customer-external-api.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ModalCustomerExternalApiComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalCustomerExternalApiComponent]
})
export class ModalCustomerExternalApiModule {}
