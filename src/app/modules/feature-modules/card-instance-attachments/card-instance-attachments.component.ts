import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { saveAs } from 'file-saver';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import { MediaViewerService } from '../media-viewer-dialog/media-viewer.service';
import CardInstanceAttachmentsConfig from './card-instance-attachments-config-interface';
import { RenameAttachmentComponent } from './subcomponets/rename-attachment/rename-attachment.component';

@Component({
  selector: 'app-card-instance-attachments',
  templateUrl: './card-instance-attachments.component.html',
  styleUrls: ['./card-instance-attachments.component.scss']
})
export class CardInstanceAttachmentsComponent implements OnInit, OnChanges {
  @Input() cardInstanceAttachmentsConfig: CardInstanceAttachmentsConfig;
  @Input() data: CardAttachmentsDTO[] = [];
  @Input() selected: AttachmentDTO[] = [];
  @Input() cardInstanceWorkflowId: number = null;
  @Input() tabId: number = null;
  @Output() reload: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() selectionChange: EventEmitter<AttachmentDTO[]> = new EventEmitter<AttachmentDTO[]>();
  public selectedAttachments: AttachmentDTO[] = [];
  public hoverTemplate: CardAttachmentsDTO;
  public hoverTemplateFrom: 'cdk' | 'appDropZone';
  public draggingAttachment: AttachmentDTO;
  public labels = {
    dropHere: marker('common.dropHere'),
    deleteConfirmation: marker('common.deleteConfirmation')
  };

  constructor(
    private dialog: MatDialog,
    private attachmentService: CardAttachmentsService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private spinnerService: ProgressSpinnerDialogService,
    private mediaViewerService: MediaViewerService
  ) {}

  ngOnInit(): void {
    if (this.selected) {
      this.selectedAttachments = this.selected;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selected) {
      this.selectedAttachments = this.selected;
    } else {
      this.selectedAttachments = [];
    }
  }

  public selectItem(item: AttachmentDTO): void {
    if (this.selectedAttachments.indexOf(item) >= 0) {
      this.selectedAttachments.splice(this.selectedAttachments.indexOf(item), 1);
    } else {
      this.selectedAttachments.push(item);
    }
    this.selected = this.selectedAttachments;
    this.selectionChange.emit(this.selectedAttachments);
  }

  public isItemSelected(item: AttachmentDTO): boolean {
    if (this.selectedAttachments.indexOf(item) >= 0) {
      return true;
    }
    return false;
  }

  public getItemBgImage(item: AttachmentDTO): string {
    if (item.thumbnail && item.type) {
      return `url("data:${item.type} ;base64,${item.thumbnail}")`;
    } else if (item.type) {
      if (item.type.indexOf('pdf') >= 0) {
        return `url(/assets/img/pdf.png)`;
      } else if (item.type.indexOf('audio') >= 0 || item.type.indexOf('mp3') >= 0) {
        return `url(/assets/img/audio-file.png)`;
      } else if (item.type.indexOf('video') >= 0) {
        return `url(/assets/img/video-file.png)`;
      } else if (item.type.indexOf('image') >= 0) {
        return `url(/assets/img/image-file.png)`;
      }
    }
    return `url(/assets/img/unknown.svg)`;
  }

  public hasPreview(item: AttachmentDTO): boolean {
    if (
      item?.type?.toLowerCase().indexOf('pdf') >= 0 ||
      item.type.indexOf('audio') >= 0 ||
      item.type.indexOf('video') >= 0 ||
      item.type.indexOf('image') >= 0
    ) {
      return true;
    }
    return false;
  }

  public downloadAttachment(item: AttachmentDTO): void {
    const spinner = this.spinnerService.show();
    //window.open(this.attachmentService.getDownloadAttachmentUrl(this.cardInstanceWorkflowId, this.tabId, item.id), '_blank');
    this.attachmentService
      .downloadAttachment(this.cardInstanceWorkflowId, this.tabId, item.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe(
        (data: AttachmentDTO) => {
          if (this.hasPreview(item)) {
            this.mediaViewerService.openMediaViewer(data);
          } else {
            saveAs(`data:${data.type};base64,${data.content}`, data.name);
          }
        },
        (error: ConcenetError) => {
          this.logger.error(error);

          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }

  public deleteAttachment(item: AttachmentDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: `${this.translateService.instant(this.labels.deleteConfirmation)}`
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.attachmentService
            .deleteAttachment(this.cardInstanceWorkflowId, this.tabId, item.id)
            .pipe(take(1))
            .subscribe(
              (data) => {
                this.reload.emit(true);
                this.spinnerService.hide(spinner);
              },
              (error: ConcenetError) => {
                this.spinnerService.hide(spinner);
                this.logger.error(error);

                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            );
        }
      });
  }

  public editAttachmentName(item: AttachmentDTO, template: CardAttachmentsDTO): void {
    if (!this.cardInstanceAttachmentsConfig.disableEditFileName) {
      this.dialog
        .open(RenameAttachmentComponent, {
          data: {
            attachment: item,
            tabId: this.tabId,
            cardInstanceWorkflowId: this.cardInstanceWorkflowId,
            templateAttachmentItemId: template.templateAttachmentItem.id
          }
        })
        .afterClosed()
        .subscribe((response) => {
          if (response) {
            this.reload.emit(true);
          }
        });
    }
  }

  public fileBrowseHandler(items: FileList, template: CardAttachmentsDTO): void {
    this.addFiles(items, template);
  }

  public fileDropped(items: FileList, template: CardAttachmentsDTO): void {
    this.addFiles(items, template);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public fileMoved(event: CdkDragDrop<any>, template: CardAttachmentsDTO) {
    if (event.container !== event.previousContainer) {
      const spinner = this.spinnerService.show();
      this.attachmentService
        .editAttachment(
          this.cardInstanceWorkflowId,
          this.tabId,
          this.draggingAttachment.id,
          this.draggingAttachment.name,
          template.templateAttachmentItem.id
        )
        .pipe(take(1))
        .subscribe(
          (data) => {
            this.spinnerService.hide(spinner);
            this.reload.emit(true);
          },
          (error: ConcenetError) => {
            this.spinnerService.hide(spinner);
            this.logger.error(error);

            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }

  public setHoverTemplate(hover: boolean, template: CardAttachmentsDTO, from: 'cdk' | 'appDropZone') {
    if (hover && (!this.hoverTemplateFrom || this.hoverTemplateFrom === from)) {
      this.hoverTemplate = template;
      this.hoverTemplateFrom = from;
    } else if (!hover && this.hoverTemplateFrom === from) {
      this.hoverTemplate = null;
      this.hoverTemplateFrom = null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getBase64(file: File): Promise<any> {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (ev) => {
        resolve(ev.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fileListToBase64(fileList: FileList): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promises: Promise<any>[] = [];
    Array.from(fileList).forEach((file: File) => {
      promises.push(this.getBase64(file));
    });
    return Promise.all(promises);
  }

  private async addFiles(files: FileList, template: CardAttachmentsDTO): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filesToSend: any[] = [];
    const filesName: string[] = [];
    this.data.forEach((cardAttachment: CardAttachmentsDTO) => {
      cardAttachment.attachments.forEach((attachment: AttachmentDTO) => {
        filesName.push(attachment.name);
      });
    });
    const arrayOfBase64 = await this.fileListToBase64(files);
    Array.from(files).forEach((file: File, i: number) => {
      const fileInfo = {
        name: filesName.indexOf(file.name) === -1 ? file.name : `${+new Date()}_${file.name}`,
        type: file.type,
        size: file.size,
        content: arrayOfBase64[i].split(';base64,')[1]
      };
      filesToSend.push(fileInfo);
    });
    const spinner = this.spinnerService.show();
    this.attachmentService
      .addAttachments(this.cardInstanceWorkflowId, this.tabId, template.templateAttachmentItem.id, filesToSend)
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.reload.emit(true);
          this.spinnerService.hide(spinner);
        },
        (error: ConcenetError) => {
          this.spinnerService.hide(spinner);
          this.logger.error(error);

          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
}
