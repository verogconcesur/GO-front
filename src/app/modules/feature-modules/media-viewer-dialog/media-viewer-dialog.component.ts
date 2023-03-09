import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { TranslateService } from '@ngx-translate/core';
import { ZoomDirective } from '@shared/directives/zoomImage.directive';
import saveAs from 'file-saver';

@Component({
  selector: 'app-media-viewer-dialog',
  templateUrl: './media-viewer-dialog.component.html',
  styleUrls: ['./media-viewer-dialog.component.scss']
})
export class MediaViewerDialogComponent implements OnInit {
  @ViewChild('zoomImage') zoomImage: ZoomDirective;
  public title = '';
  public attachment: AttachmentDTO;
  public labels = {
    titlePdf: marker('common.pdfViewer'),
    titleImage: marker('common.imageViewer'),
    titleVideo: marker('common.videoViewer'),
    titleAudio: marker('common.audioViewer'),
    download: marker('common.download'),
    reset: marker('common.reset')
  };

  constructor(
    private dialogRef: MatDialogRef<MediaViewerDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public dialogData: AttachmentDTO
  ) {}

  ngOnInit(): void {
    if (this.dialogData) {
      this.attachment = this.dialogData;
      this.title = this.attachment.name ? this.attachment.name : this.translateService.instant(this.labels.titlePdf);
    }
  }

  public isFileType(type: 'pdf' | 'video' | 'audio' | 'image'): boolean {
    return this.attachment.type.indexOf(type) >= 0;
  }

  public getTitle(): string {
    if (this.isFileType('pdf')) {
      return this.labels.titlePdf;
    } else if (this.isFileType('image')) {
      return this.labels.titleImage;
    } else if (this.isFileType('video')) {
      return this.labels.titleVideo;
    } else if (this.isFileType('audio')) {
      return this.labels.titleAudio;
    }
    return '';
  }

  public close(): void {
    this.dialogRef.close();
  }

  public getDataBase64(): string {
    return `data:${this.attachment.type};base64,${this.attachment.content}`;
  }

  public download(): void {
    saveAs(this.getDataBase64(), this.attachment.name);
  }
}
