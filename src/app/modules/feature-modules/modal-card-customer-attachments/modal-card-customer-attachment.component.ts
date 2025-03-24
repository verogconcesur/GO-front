import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CustomerAttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { WorkflowAttachmentTimelineDTO } from '@data/models/workflow-admin/workflow-attachment-timeline-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { saveAs } from 'file-saver';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
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
  public showAddAttchment: boolean;
  public labels = {
    attachmentsTab: marker('entities.customers.attachments.attachmentsTab'),
    category: marker('entities.customers.attachments.category')
  };
  public attachmentTemplates: WorkflowAttachmentTimelineDTO[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachmentItemsMap: { [key: number]: any[] } = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public filteredAttachmentItems: any[] = [];
  public data: CustomerAttachmentDTO[] = [];
  public selectedAttachments: AttachmentDTO[] = [];
  public cardInstanceWorkflowId: number;
  public tabId: number;
  public attachmentsForm: FormGroup;
  public form: UntypedFormGroup;
  public idCard: number;
  public clientId: number;
  public customerAttachTabId: number;
  public customerAttachTemplateAttachmentItemId: number;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private attachmentService: CardAttachmentsService,
    private mediaViewerService: MediaViewerService,
    private customDialogService: CustomDialogService
  ) {
    super(
      modalCardCustomerAttachmentsComponentModalEnum.ID,
      modalCardCustomerAttachmentsComponentModalEnum.PANEL_CLASS,
      modalCardCustomerAttachmentsComponentModalEnum.TITLE
    );
  }

  // Convenience getter for easy access to form fields
  get attachmentsArray(): FormArray {
    return this.attachmentsForm?.get('attachments') as FormArray;
  }

  ngOnInit(): void {
    this.attachmentTemplates = this.extendedComponentData.attachmentTemplates;
    this.customerAttachTabId = this.extendedComponentData.customerAttachTabId;
    this.customerAttachTemplateAttachmentItemId = this.extendedComponentData.customerAttachTemplateAttachmentItemId;
    this.idCard = this.extendedComponentData.idCard;
    this.showAddAttchment = this.extendedComponentData.showAddAttchment;
    this.clientId = this.extendedComponentData.clientId;
    this.initializeForm();
    this.fetchAttachments();
    this.getAttachmentsData();
  }

  ngOnDestroy(): void {}

  public onSubmitCustomDialog(): Observable<boolean | AttachmentDTO[]> {
    const formValue = this.attachmentsForm.value;
    const attachmentsResp = formValue.attachments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => item.enabled)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ({
        tabId: item.attachmentsTab,
        templateAttachmentItemId: item.attachmentsCategory,
        customerAttachmentId: item.id
      }));
    if (!this.showAddAttchment) {
      const spinner = this.spinnerService.show();
      return this.attachmentService.saveAttachmentsCustomers(this.idCard, attachmentsResp).pipe(
        map((response) => {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.customDialogService.close(modalCardCustomerAttachmentsComponentModalEnum.ID);
          return response;
        }),
        catchError((error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          return of(false);
        }),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      );
    } else {
      this.attachmentService.updateAttachmentsForm(attachmentsResp);
      return of(true);
    }
  }

  confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  getAttachmentsData() {
    this.attachmentTemplates?.forEach((template) => {
      this.attachmentItemsMap[template.id] = template.template.templateAttachmentItems;
    });
  }

  public getAttachmentItems(templateId: number) {
    return this.attachmentItemsMap[templateId] || [];
  }

  public onTemplateChange(event: MatSelectChange, attachmentControl: AbstractControl): void {
    const selectedTemplateId = event.value;
    attachmentControl.get('attachmentsCategory')?.setValue(null);
  }

  getItemsByTemplate(templateId: number) {
    return this.attachmentItemsMap[templateId] || [];
  }

  fetchAttachments(): void {
    this.data = [];
    const spinner = this.spinnerService.show();
    this.attachmentService
      .getCustomerAttachments(this.clientId)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data) => {
          this.data = data;
          this.attachmentsArray.clear();
          this.populateFormWithAttachments();
        },
        error: (err: ConcenetError) => {
          this.globalMessageService.showError({
            message: err.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  clearSelection(attachmentControl: AbstractControl, event: MouseEvent): void {
    // Resetea los valores de attachmentsTab y attachmentsCategory
    attachmentControl.get('attachmentsTab')?.setValue(null);
    attachmentControl.get('attachmentsCategory')?.setValue(null);
    event.stopPropagation();
  }
  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.isAttachmentFormValid()
        }
      ]
    };
  }

  public isItemSelected(item: AttachmentDTO): boolean {
    return this.selectedAttachments.indexOf(item) >= 0;
  }

  public getItemBgImage(item: CustomerAttachmentDTO): string {
    if (item.file.thumbnail[0] && item.file.type[0]) {
      return `url("data:${item.file.type[0]} ;base64,${item.file.thumbnail[0]}")`;
    } else if (item.file.type[0]) {
      if (item.file.type[0].indexOf('pdf') >= 0) {
        return `url(/assets/img/pdf.png)`;
      } else if (item.file.type[0].indexOf('audio') >= 0 || item.file.type[0].indexOf('mp3') >= 0) {
        return `url(/assets/img/audio-file.png)`;
      } else if (item.file.type[0].indexOf('video') >= 0) {
        return `url(/assets/img/video-file.png)`;
      } else if (item.file.type[0].indexOf('image') >= 0) {
        return `url(/assets/img/image-file.png)`;
      }
    }
    return `url(/assets/img/unknown.svg)`;
  }

  public hasPreview(item: CustomerAttachmentDTO): boolean {
    if (
      item?.file?.type[0]?.toLowerCase().indexOf('pdf') >= 0 ||
      item?.file?.type[0]?.indexOf('audio') >= 0 ||
      item?.file?.type[0]?.indexOf('video') >= 0 ||
      item?.file?.type[0]?.indexOf('image') >= 0
    ) {
      return true;
    }
    return false;
  }

  public fileBrowseHandler(items: FileList): void {
    this.addFiles(items);
  }

  public fileDropped(items: FileList): void {
    this.addFiles(items);
  }

  public clearSelect(index: number): void {
    const attachmentGroup = this.attachmentsArray.at(index) as FormGroup;
    attachmentGroup.get('option1').setValue('');
    attachmentGroup.get('option2').setValue('');
  }
  public toggleSelects(attachmentControl: AbstractControl): void {
    const currentState = attachmentControl.get('enabled')?.value;
    attachmentControl.get('enabled')?.setValue(!currentState);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public downloadAttachment(item: AttachmentDTO, list: FormArray<any>): void {
    const listAttachments: AttachmentDTO[] = Object.values(list);
    const spinner = this.spinnerService.show();
    //window.open(this.attachmentService.getDownloadAttachmentUrl(this.cardInstanceWorkflowId, this.tabId, item.id), '_blank');
    this.attachmentService
      .downloadCustomerAttachment(this.clientId, item.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe(
        (data: CustomerAttachmentDTO) => {
          if (this.hasPreview(item)) {
            const listFiltered = listAttachments.filter((att: CustomerAttachmentDTO) => this.hasPreview(att));
            this.mediaViewerService.openMediaViewerMúltiple(data, listAttachments, null, null);
          } else {
            saveAs(`data:${data.file.type};base64,${data.file.content}`, data.file.name);
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

  isAttachmentFormValid(): boolean {
    return this.attachmentsArray?.controls?.some((attachmentGroup: FormGroup) => {
      const enabled = attachmentGroup.get('enabled')?.value;
      const attachmentsTab = attachmentGroup.get('attachmentsTab')?.value;
      const attachmentsCategory = attachmentGroup.get('attachmentsCategory')?.value;
      return enabled && attachmentsTab && attachmentsCategory;
    });
  }

  private addAttachment(attachment: CustomerAttachmentDTO): void {
    const attachmentFormGroup = this.fb.group({
      active: [attachment.active],
      id: [attachment.id],
      auto: [attachment.auto],
      createDate: [attachment.createDate],
      createdByFullName: [attachment.createdByFullName],
      customerId: [attachment.customerId],
      file: {
        content: [attachment.file.content],
        id: [attachment.file.id],
        name: [attachment.file.name],
        size: [attachment.file.size],
        thumbnail: [attachment.file.thumbnail],
        type: [attachment.file.type],
        showInLanding: [attachment.file.showInLanding]
      },
      updateDate: [attachment.updateDate],
      updatedByFullName: [attachment.updatedByFullName],
      attachmentsTab: [this.customerAttachTabId ? this.customerAttachTabId : null],
      attachmentsCategory: [this.customerAttachTemplateAttachmentItemId ? this.customerAttachTemplateAttachmentItemId : null],
      enabled: [false]
    });
    this.attachmentsArray.push(attachmentFormGroup);
  }

  private populateFormWithAttachments(): void {
    this.data.forEach((attachment) => {
      if (attachment.active) {
        this.addAttachment(attachment);
      }
    });
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

  private async addFiles(files: FileList): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filesToSend: any[] = [];
    const filesName: string[] = [];
    this.data.forEach((attachment: CustomerAttachmentDTO) => {
      filesName.push(attachment.file.name);
    });
    const arrayOfBase64 = await this.fileListToBase64(files);
    console.log(arrayOfBase64);
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
    const customerIdValue: number = null;
    const customerFilesToSend = filesToSend.map((file) => ({
      id: customerIdValue,
      customerId: customerIdValue,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        content: file.content
      }
    }));
    this.attachmentService
      .addClientAttachments(this.clientId, customerFilesToSend)
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.fetchAttachments();
          this.spinnerService.hide(spinner);
        },
        (error: ConcenetError) => {
          this.spinnerService.hide(spinner);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }

  private initializeForm = (): void => {
    this.attachmentsForm = this.fb.group({
      attachments: this.fb.array([])
    });
  };
}
