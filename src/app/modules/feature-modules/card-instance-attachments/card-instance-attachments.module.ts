import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardInstanceAttachmentsComponent } from './card-instance-attachments.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [CardInstanceAttachmentsComponent],
  imports: [CommonModule, SharedModule],
  exports: [CardInstanceAttachmentsComponent]
})
export class CardInstanceAttachmentsModule {}
