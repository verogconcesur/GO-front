import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { take } from 'rxjs/operators';
import { PdfViewerDialogComponent } from './pdf-viewer-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PdfViewerService implements OnDestroy {
  constructor(private dialog: MatDialog) {}

  ngOnDestroy(): void {}

  public openPdfViewer(data: AttachmentDTO): void {
    this.dialog
      .open(PdfViewerDialogComponent, {
        maxWidth: '95%',
        minWidth: '600px',
        width: '75%',
        height: '90%',
        panelClass: 'pdf-viewer-wrapper',
        disableClose: true,
        data
      })
      .afterClosed()
      .pipe(take(1));
  }
}
