import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalStartConversationComponent } from './modal-start-conversation.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ModalStartConversationComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalStartConversationComponent]
})
export class ModalStartConversationModule {}
