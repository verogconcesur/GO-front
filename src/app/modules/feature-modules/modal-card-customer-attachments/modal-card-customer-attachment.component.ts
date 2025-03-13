import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { WorkflowAttachmentTimelineDTO } from '@data/models/workflow-admin/workflow-attachment-timeline-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { saveAs } from 'file-saver';
import { Observable, of } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { WorkflowAdministrationService } from '../../../data/services/workflow-administration.service';
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
  public labels = {};
  public attachmentTemplates: WorkflowAttachmentTimelineDTO[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachmentItemsMap: { [key: number]: any[] } = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public filteredAttachmentItems: any[] = [];
  public data: CardAttachmentsDTO[] = [];
  public selectedAttachments: AttachmentDTO[] = [];
  public cardInstanceWorkflowId: number;
  public tabId: number;
  public attachmentsForm: FormGroup;
  public form: UntypedFormGroup;
  public workflowId: number;
  private apiUrl = 'https://concenet-dev.sdos.es/concenet-rest/api/cardInstanceWorkflow/detail/1800/attachments/11';

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private httpClient: HttpClient,
    private attachmentService: CardAttachmentsService,
    private mediaViewerService: MediaViewerService,
    private workflowadministrationService: WorkflowAdministrationService
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
    this.initializeForm();
    this.attachmentTemplates = this.extendedComponentData.attachmentTemplates;
    this.showAddAttchment = this.extendedComponentData.showAddAttchment;
    this.fetchAttachments();
    this.getAttachmentsData();
  }

  ngOnDestroy(): void {}

  public onSubmitCustomDialog(): Observable<boolean | AttachmentDTO[]> {
    // const formValue = this.customerForm.value;
    const spinner = this.spinnerService.show();
    // return this.entitiesService.createCustomer(formValue).pipe(
    //   map((response) => {
    //     this.globalMessageService.showSuccess({
    //       message: this.translateService.instant(marker('common.successOperation')),
    //       actionText: this.translateService.instant(marker('common.close'))
    //     });
    //     return response;
    //   }),
    //   catchError((error) => {
    //     this.globalMessageService.showError({
    //       message: error.message,
    //       actionText: this.translateService.instant(marker('common.close'))
    //     });
    //     return of(false);
    //   }),
    //   finalize(() => {
    //     this.spinnerService.hide(spinner);
    //   })
    // );
    return of(true);
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
    // Reseteamos 'attachmentsCategory' para que el usuario seleccione nuevamente la categoría
    attachmentControl.get('attachmentsCategory')?.setValue(null);
    this.updateAttachmentItems(selectedTemplateId);
  }

  public updateAttachmentItems(templateId: number): void {
    // Filtramos los items de 'attachmentsCategory' según el templateId seleccionado
    const items = this.attachmentItemsMap[templateId] || [];
    this.filteredAttachmentItems = items;
  }

  fetchAttachments(): void {
    this.data = [];
    const spinner = this.spinnerService.show();
    this.httpClient.get<CardAttachmentsDTO[]>(this.apiUrl).subscribe(
      (data) => {
        this.spinnerService.hide(spinner);
        this.data = data;
        this.populateFormWithAttachments();
      },
      (error) => {
        this.spinnerService.hide(spinner);
        console.error('Error fetching attachments', error);
      }
    );
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
          color: 'primary'
        }
      ]
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
    console.log('entra');
    const currentState = attachmentControl.get('enabled')?.value;
    attachmentControl.get('enabled')?.setValue(!currentState);
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

  private addAttachment(attachment: AttachmentDTO): void {
    const attachmentFormGroup = this.fb.group({
      content: [attachment.content],
      id: [attachment.id],
      name: [attachment.name],
      size: [attachment.size],
      thumbnail: [attachment.thumbnail],
      type: [attachment.type],
      showInLanding: [attachment.showInLanding],
      attachmentsTab: [attachment.attachmentsTab || ''],
      attachmentsCategory: [attachment.attachmentsCategory || ''],
      enabled: [false]
    });

    this.attachmentsArray.push(attachmentFormGroup);
  }

  private populateFormWithAttachments(): void {
    this.data.forEach((template) => {
      template.attachments?.forEach((attachment) => {
        this.addAttachment(attachment);
      });
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
    //TODO Nuevo servicio para adjuntar archivos
    // this.attachmentService
    //   .addAttachments(this.cardInstanceWorkflowId, this.tabId, filesToSend)
    //   .pipe(take(1))
    //   .subscribe(
    //     (data) => {
    //       this.fetchAttachments(); // Llama a fetchAttachments para recargar la lista
    //       this.spinnerService.hide(spinner);
    //     },
    //     (error: ConcenetError) => {
    //       this.spinnerService.hide(spinner);
    //       this.globalMessageService.showError({
    //         message: error.message,
    //         actionText: this.translateService.instant(marker('common.close'))
    //       });
    //     }
    //   );
  }

  private initializeForm = (): void => {
    this.attachmentsForm = this.fb.group({
      attachments: this.fb.array([])
    });
  };
}
