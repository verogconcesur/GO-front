import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
// eslint-disable-next-line max-len
import { ModalCardCustomerAttachmentsComponent } from '../modal-card-customer-attachments/modal-card-customer-attachment.component';
import { ModalChatWhatsappComponent } from './modal-chat-whatsapp.component';

@NgModule({
  declarations: [ModalChatWhatsappComponent, ModalCardCustomerAttachmentsComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalChatWhatsappComponent]
})
export class ModalChatWhatsappModule {}
