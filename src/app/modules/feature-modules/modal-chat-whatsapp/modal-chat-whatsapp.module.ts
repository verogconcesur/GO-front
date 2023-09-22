import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalChatWhatsappComponent } from './modal-chat-whatsapp.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ModalChatWhatsappComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalChatWhatsappComponent]
})
export class ModalChatWhatsappModule {}
