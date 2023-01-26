import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { group } from 'console';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-sign-document-add-file',
  templateUrl: './sign-document-add-file.component.html',
  styleUrls: ['./sign-document-add-file.component.scss']
})
export class SignDocumentAddFileComponent implements OnInit {
  @Input() wCardId: number;
  @Output() fileSelected: EventEmitter<{ file: AttachmentDTO; tabId: number }> = new EventEmitter();
  @ViewChild('fileDropRef')
  fileDropRef: ElementRef;
  public attachmentsByGroup: CardAttachmentsDTO[] = [];
  public labels = {
    selectOrAddPdf: marker('administration.templates.checklists.selectOrAddPdf'),
    attachment: marker('common.select'),
    selectCardAttachmentPdf: marker('administration.templates.checklists.selectCardAttachmentPdf'),
    addAttachmentPdf: marker('administration.templates.checklists.addAttachmentPdf'),
    dropHere: marker('administration.templates.checklists.dropHere')
  };

  constructor(
    private templatesChecklistsService: TemplatesChecklistsService,
    private spinnerService: ProgressSpinnerDialogService,
    private translateService: TranslateService,
    private logger: NGXLogger,
    private globalMessageService: GlobalMessageService
  ) {}

  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.templatesChecklistsService
      .getAttachmentsChecklistByWCardId(this.wCardId)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data) => {
          this.attachmentsByGroup = data
            .map((d) => {
              d.tabName = d.templateAttachmentItem.name;
              d.attachments = d.attachments.filter((a) => a.type.toLowerCase().indexOf('pdf') >= 0);
              return d;
            })
            .filter((d) => d.attachments.length > 0);
        },
        error: (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public attachmentSelected(event: { value: { attachment: AttachmentDTO; group: any } }): void {
    this.fileSelected.emit({ file: event.value.attachment, tabId: event.value.group.tabId });
  }

  public fileBrowseHandler(item: FileList): void {
    this.getFile(item);
  }

  public fileDropped(item: FileList): void {
    this.getFile(item);
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

  private async getFile(files: FileList): Promise<void> {
    if (files.length !== 1) {
      this.globalMessageService.showError({
        message: this.translateService.instant(marker('errors.uploadOnlyOneFile')),
        actionText: this.translateService.instant(marker('common.close'))
      });
      return null;
    }
    const file = files[0];
    if (file.type.toLowerCase().indexOf('pdf') === -1) {
      this.globalMessageService.showError({
        message: this.translateService.instant(marker('errors.fileFormat'), { format: 'PDF' }),
        actionText: this.translateService.instant(marker('common.close'))
      });
      return null;
    }
    const base64 = await this.getBase64(file);
    const attachment: AttachmentDTO = {
      content: base64.split(';base64,')[1],
      id: null,
      name: file.name,
      size: file.size,
      thumbnail: null,
      type: file.type
    };
    this.fileSelected.emit({ file: attachment, tabId: null });
  }
}
