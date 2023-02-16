import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaViewerDialogComponent } from './media-viewer-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MediaViewerService } from './media-viewer.service';

@NgModule({
  declarations: [MediaViewerDialogComponent],
  imports: [CommonModule, SharedModule, NgxExtendedPdfViewerModule],
  exports: [MediaViewerDialogComponent],
  providers: [MediaViewerService]
})
export class MediaViewerDialogModule {}
