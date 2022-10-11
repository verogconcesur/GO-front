import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardInstanceAttachmentsComponent } from './card-instance-attachments.component';
import { SharedModule } from '@shared/shared.module';
import { RenameAttachmentComponent } from './subcomponets/rename-attachment/rename-attachment.component';

@NgModule({
  declarations: [CardInstanceAttachmentsComponent, RenameAttachmentComponent],
  imports: [CommonModule, SharedModule],
  exports: [CardInstanceAttachmentsComponent]
})
export class CardInstanceAttachmentsModule {}
