import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { saveAs } from 'file-saver';
import { Observable, of } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { MediaViewerService } from '../media-viewer-dialog/media-viewer.service';

export const enum modalCardCustomerAttachmentsComponentModalEnum {
  ID = 'modal-card-customer-attachments-id',
  PANEL_CLASS = 'modal-card-customer-attachments-dialog',
  TITLE = 'entities.customers.customerAttachments'
}

@Component({
  selector: 'app-card-modal-customer-attachments',
  templateUrl: './modal-card-customer-attachments.component.html',
  styleUrls: ['./modal-card-customer-attachments.component.scss']
})
export class ModalCardCustomerAttachmentsComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {};
  public options1: string[] = ['Option 1A', 'Option 1B', 'Option 1C'];
  public options2: string[] = ['Option 2A', 'Option 2B', 'Option 2C'];
  public data: CardAttachmentsDTO[] = [];
  public selectedAttachments: AttachmentDTO[] = [];
  public cardInstanceWorkflowId: number;
  public tabId: number;
  public form: UntypedFormGroup;
  private apiUrl = 'https://concenet-dev.sdos.es/concenet-rest/api/cardInstanceWorkflow/detail/1846/attachments/11';

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private httpClient: HttpClient,
    private attachmentService: CardAttachmentsService,
    private mediaViewerService: MediaViewerService
  ) {
    super(
      modalCardCustomerAttachmentsComponentModalEnum.ID,
      modalCardCustomerAttachmentsComponentModalEnum.PANEL_CLASS,
      modalCardCustomerAttachmentsComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      option1: [''],
      option2: ['']
    });
    this.fetchAttachments();
  }

  ngOnDestroy(): void {}

  onSubmitCustomDialog(): Observable<boolean> {
    return of(true);
  }

  confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  fetchAttachments(): void {
    this.data = [];
    const spinner = this.spinnerService.show();
    this.httpClient.get<CardAttachmentsDTO[]>(this.apiUrl).subscribe(
      (data) => {
        this.spinnerService.hide(spinner);
        this.data = data;
      },
      (error) => {
        this.spinnerService.hide(spinner);
        console.error('Error fetching attachments', error);
      }
    );
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: []
    };
  }

  public selectItem(item: AttachmentDTO): void {
    const index = this.selectedAttachments.indexOf(item);
    if (index >= 0) {
      this.selectedAttachments.splice(index, 1);
    } else {
      this.selectedAttachments.push(item);
    }
  }

  public isItemSelected(item: AttachmentDTO): boolean {
    return this.selectedAttachments.indexOf(item) >= 0;
  }

  public getItemBgImage(item: AttachmentDTO): string {
    if (item.thumbnail && item.type) {
      return `url("data:${item.type};base64,${item.thumbnail}")`;
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
    return ['pdf', 'audio', 'video', 'image'].some((type) => item?.type?.toLowerCase().includes(type));
  }

  public downloadAttachment(item: AttachmentDTO, list: AttachmentDTO[]): void {
    const spinner = this.spinnerService.show();

    this.attachmentService
      .downloadAttachment(this.cardInstanceWorkflowId, this.tabId, item.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe(
        (data: AttachmentDTO) => {
          if (this.hasPreview(item)) {
            const listFiltered = list.filter((att: AttachmentDTO) => this.hasPreview(att));
            this.mediaViewerService.openMediaViewerMúltiple(data, listFiltered, this.cardInstanceWorkflowId, this.tabId);
          } else {
            saveAs(`data:${data.type};base64,${data.content}`, data.name);
          }
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
