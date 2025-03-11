import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
// eslint-disable-next-line max-len
import { ModalChatWhatsappComponent } from './modal-chat-whatsapp.component';

@NgModule({
  declarations: [ModalChatWhatsappComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalChatWhatsappComponent]
})
export class ModalChatWhatsappModule {}
