import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ModalCardCustomerAttachmentsComponent } from './modal-card-customer-attachment.component';

@NgModule({
  declarations: [ModalCardCustomerAttachmentsComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalCardCustomerAttachmentsComponent]
})
export class ModalCardCustomerAttachmentsModule {}
