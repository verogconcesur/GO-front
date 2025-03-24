import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AttachmentDTO, CustomerAttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { take } from 'rxjs/operators';
import { MediaViewerDialogComponent } from './media-viewer-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class MediaViewerService implements OnDestroy {
  constructor(private dialog: MatDialog) {}

  ngOnDestroy(): void {}

  public openMediaViewer(data: AttachmentDTO): void {
    const minWidth = '600px';
    let width = '75%';
    let height = '90%';
    if (data.type.indexOf('audio') >= 0) {
      width = '600px';
      height = '200px';
    }
    this.dialog
      .open(MediaViewerDialogComponent, {
        maxWidth: '95%',
        minWidth,
        width,
        height,
        panelClass: 'media-viewer-wrapper',
        disableClose: true,
        data
      })
      .afterClosed()
      .pipe(take(1));
  }
  public openMediaViewerMúltiple(
    current: AttachmentDTO | CustomerAttachmentDTO,
    list: AttachmentDTO[],
    cardInstanceId: number,
    tabId: number
  ): void {
    const data = {
      current,
      list,
      cardInstanceId,
      tabId
    };
    this.dialog
      .open(MediaViewerDialogComponent, {
        maxWidth: '95%',
        minWidth: '600px',
        width: '75%',
        height: '90%',
        panelClass: 'media-viewer-wrapper',
        disableClose: true,
        data
      })
      .afterClosed()
      .pipe(take(1));
  }
}
