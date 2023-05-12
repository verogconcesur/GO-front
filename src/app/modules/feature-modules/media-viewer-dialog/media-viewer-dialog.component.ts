import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { TranslateService } from '@ngx-translate/core';
import { ZoomDirective } from '@shared/directives/zoomImage.directive';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import saveAs from 'file-saver';
import _ from 'lodash';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-media-viewer-dialog',
  templateUrl: './media-viewer-dialog.component.html',
  styleUrls: ['./media-viewer-dialog.component.scss']
})
export class MediaViewerDialogComponent implements OnInit {
  @ViewChild('zoomImage') zoomImage: ZoomDirective;
  public title = '';
  public attachment: AttachmentDTO;
  public attachmentList: AttachmentDTO[];
  public cardInstanceId: number;
  public tabId: number;
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
    private attachmentService: CardAttachmentsService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {}

  ngOnInit(): void {
    if (this.dialogData && this.dialogData.current) {
      this.dialogData = this.dialogData as {
        current: AttachmentDTO;
        list: AttachmentDTO[];
        cardInstanceId: number;
        tabId: number;
      };
      this.attachment = this.dialogData.current;
      this.attachmentList = this.dialogData.list;
      this.cardInstanceId = this.dialogData.cardInstanceId;
      this.tabId = this.dialogData.tabId;
    } else {
      this.dialogData = this.dialogData as AttachmentDTO;
      this.attachment = this.dialogData;
    }
    this.title = this.attachment.name ? this.attachment.name : this.translateService.instant(this.labels.titlePdf);
  }
  public showNext(): boolean {
    if (this.attachmentList) {
      const index = _.findIndex(this.attachmentList, (att: AttachmentDTO) => att.id === this.attachment.id);
      return index < this.attachmentList.length - 1;
    } else {
      return false;
    }
  }
  public goNext(): void {
    const index = _.findIndex(this.attachmentList, (att: AttachmentDTO) => att.id === this.attachment.id);
    const thumbAttach = this.attachmentList[index + 1];
    if (thumbAttach) {
      const spinner = this.spinnerService.show();
      this.attachmentService
        .downloadAttachment(this.cardInstanceId, this.tabId, thumbAttach.id)
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe(
          (data: AttachmentDTO) => {
            this.attachment = data;
            this.title = this.attachment.name ? this.attachment.name : this.translateService.instant(this.labels.titlePdf);
          },
          (error: ConcenetError) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }
  public showPrev(): boolean {
    if (this.attachmentList) {
      const index = _.findIndex(this.attachmentList, (att: AttachmentDTO) => att.id === this.attachment.id);
      return index > 0;
    } else {
      return false;
    }
  }
  public goPrev(): void {
    const index = _.findIndex(this.attachmentList, (att: AttachmentDTO) => att.id === this.attachment.id);
    const thumbAttach = this.attachmentList[index - 1];
    if (thumbAttach) {
      const spinner = this.spinnerService.show();
      this.attachmentService
        .downloadAttachment(this.cardInstanceId, this.tabId, thumbAttach.id)
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe(
          (data: AttachmentDTO) => {
            this.attachment = data;
            this.title = this.attachment.name ? this.attachment.name : this.translateService.instant(this.labels.titlePdf);
          },
          (error: ConcenetError) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
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
