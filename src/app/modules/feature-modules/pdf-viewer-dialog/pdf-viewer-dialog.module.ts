import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerDialogComponent } from './pdf-viewer-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfViewerService } from './pdf-viewer.service';

@NgModule({
  declarations: [PdfViewerDialogComponent],
  imports: [CommonModule, SharedModule, NgxExtendedPdfViewerModule],
  exports: [PdfViewerDialogComponent],
  providers: [PdfViewerService]
})
export class PdfViewerDialogModule {}
