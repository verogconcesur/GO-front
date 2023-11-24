import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardInstanceAttachmentsComponent } from './card-instance-attachments.component';
import { SharedModule } from '@shared/shared.module';
import { RenameAttachmentComponent } from './subcomponets/rename-attachment/rename-attachment.component';
import { MediaViewerDialogModule } from '../media-viewer-dialog/media-viewer-dialog.module';

@NgModule({
  declarations: [CardInstanceAttachmentsComponent, RenameAttachmentComponent],
  imports: [CommonModule, SharedModule, MediaViewerDialogModule],
  exports: [CardInstanceAttachmentsComponent]
})
export class CardInstanceAttachmentsModule {}
