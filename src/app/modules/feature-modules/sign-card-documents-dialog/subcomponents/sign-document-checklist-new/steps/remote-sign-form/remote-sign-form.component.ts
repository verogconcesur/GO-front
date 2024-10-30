import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { TemplateChecklistItemDTO } from '@data/models/templates/templates-checklists-dto';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import {
  InsertSignComponentModalEnum,
  ModalInsertSignComponent
} from '@modules/feature-modules/modal-insert-sign/modal-insert-sign.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-remote-sign-form',
  templateUrl: './remote-sign-form.component.html',
  styleUrls: ['./remote-sign-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemoteSignFormComponent implements OnInit {
  @Input() wCardId: number;
  @Input() templateChecklistItems: TemplateChecklistItemDTO[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() printItemImageInPdf = new EventEmitter<{ jQItem: any; fg: any }>();
  @ViewChild('staticImage')
  staticImage: ElementRef;
  public checklistForm: UntypedFormGroup;
  public selectedItemToUploadImage: number;
  public labels = {
    selectCardAttachmentImage: marker('administration.templates.checklists.selectCardAttachmentImage'),
    uploadImage: marker('common.uploadImage')
  };
  public attachmentsByGroup: CardAttachmentsDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private customDialogService: CustomDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private spinnerService: ProgressSpinnerDialogService,
    private templatesChecklistsService: TemplatesChecklistsService
  ) {}

  ngOnInit(): void {
    this.getImageAttachments();
    this.initForm();
  }

  public updateValueAndValidityForm(): void {
    this.checklistForm.get('templateChecklistItemsCheck').updateValueAndValidity();
    this.checklistForm.get('templateChecklistItemsText').updateValueAndValidity();
    this.checklistForm.get('templateChecklistItemsImage').updateValueAndValidity();
    this.checklistForm.get('templateChecklistItemsSign').updateValueAndValidity();
    this.checklistForm.updateValueAndValidity();
  }

  public getValueControl(from: 'CHECK' | 'SIGN' | 'TEXT' | 'IMAGE', formControl: FormControl): FormControl {
    switch (from) {
      case 'CHECK':
        return formControl.get('itemVal').get('booleanValue') as FormControl;
      case 'TEXT':
        return formControl.get('itemVal').get('textValue') as FormControl;
    }
  }

  public getFormValue(): TemplateChecklistItemDTO[] {
    const formValue = this.checklistForm.getRawValue();
    return [
      ...formValue.templateChecklistItemsCheck,
      ...formValue.templateChecklistItemsText,
      ...formValue.templateChecklistItemsImage,
      ...formValue.templateChecklistItemsSign
    ];
  }

  public editSign(sign: FormControl): void {
    this.customDialogService
      .open({
        component: ModalInsertSignComponent,
        id: InsertSignComponentModalEnum.ID,
        panelClass: InsertSignComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '500px'
      })
      .pipe(take(1))
      .subscribe((data) => {
        sign.get('itemVal.fileValue').get('content').setValue(data.split('base64,')[1]);
        sign.get('itemVal.fileValue').get('type').setValue(data.split(';base64,')[0].split('data:')[1]);
        sign.get('itemVal.fileValue').get('size').setValue(data.length);
        sign
          .get('itemVal.fileValue')
          .get('name')
          .setValue(`clientSign.${data.split(';base64,')[0].split('data:')[1].split('/')[1]}`);
        sign.markAsDirty();
        sign.markAsTouched();
      });
  }

  public getSignSrc(sign: FormControl): string {
    const signValue = sign.getRawValue();
    if (signValue?.itemVal?.fileValue?.content && signValue?.itemVal?.fileValue?.type) {
      return `data:${signValue?.itemVal?.fileValue?.type};base64,${signValue?.itemVal?.fileValue?.content}`;
    }
    return null;
  }

  public imageAttachmentSelected(event: { value: AttachmentDTO }, fc: UntypedFormControl) {
    const file: AttachmentDTO = event.value;
    fc.get('itemVal')
      .get('fileValue')
      .get('id')
      .setValue(file.id ? file.id : null);
    fc.get('itemVal')
      .get('fileValue')
      .get('name')
      .setValue(file?.name ? file.name : null);
    fc.get('itemVal')
      .get('fileValue')
      .get('type')
      .setValue(file?.type ? file.type : null);
    fc.get('itemVal')
      .get('fileValue')
      .get('size')
      .setValue(file?.size ? file.size : null);
    fc.get('itemVal')
      .get('fileValue')
      .get('content')
      .setValue(file?.content ? file.content : null, { emit: true });
    fc.get('itemVal')
      .get('fileValue')
      .get('thumbnail')
      .setValue(file?.thumbnail ? file.thumbnail : null, { emit: true });
    this.updateValueAndValidityForm();

    const id = `item_${fc.get('orderNumber').value}`;
    const jQItem = $(`#${id}`);
    this.printItemImageInPdf.emit({ jQItem, fg: fc });
  }

  public getImagePreviewBase64(fc: UntypedFormControl): string {
    if (
      fc?.get('itemVal')?.get('fileValue')?.get('type')?.value &&
      (fc?.get('itemVal')?.get('fileValue')?.get('content')?.value ||
        fc?.get('itemVal')?.get('fileValue')?.get('thumbnail')?.value)
    ) {
      return `data:${fc.get('itemVal').get('fileValue').get('type').value};base64,${
        fc.get('itemVal').get('fileValue').get('content').value
          ? fc.get('itemVal').get('fileValue').get('content').value
          : fc?.get('itemVal')?.get('fileValue')?.get('thumbnail')?.value
      }`;
    }
    return '';
  }

  public addStaticImage(item: FileList): void {
    this.getImageFile(item, this.selectedItemToUploadImage);
  }

  public getChecklistItemByIndex(ordNumber: number): UntypedFormControl {
    const fc: UntypedFormControl = null;
    if ((ordNumber || ordNumber === 0) && this.checklistForm.get('templateChecklistItemsImage')) {
      return (this.checklistForm.get('templateChecklistItemsImage') as UntypedFormArray).controls[
        ordNumber
      ] as UntypedFormControl;
    }
    return fc;
  }

  private async getImageFile(files: FileList, itemIndex: number): Promise<void> {
    if (files.length !== 1) {
      this.globalMessageService.showError({
        message: this.translateService.instant(marker('errors.uploadOnlyOneFile')),
        actionText: this.translateService.instant(marker('common.close'))
      });
      return null;
    }
    const file = files[0];
    if (file.type.toLowerCase().indexOf('image') === -1) {
      this.globalMessageService.showError({
        message: this.translateService.instant(marker('errors.fileFormat'), {
          format: this.translateService.instant(marker('common.image'))
        }),
        actionText: this.translateService.instant(marker('common.close'))
      });
      return null;
    }
    const base64 = await this.getBase64(file);
    const fg: UntypedFormControl = this.getChecklistItemByIndex(itemIndex);
    // console.log(fg);
    fg.get('itemVal').get('fileValue').get('id').setValue(null);
    fg.get('itemVal').get('fileValue').get('name').setValue(file.name);
    fg.get('itemVal').get('fileValue').get('type').setValue(file.type);
    fg.get('itemVal').get('fileValue').get('size').setValue(file.size);
    fg.get('itemVal').get('fileValue').get('content').setValue(base64.split(';base64,')[1], { emit: true });
    this.checklistForm.markAsDirty();
    this.checklistForm.markAsTouched();
    const id = `item_${fg.get('orderNumber').value}`;
    const jQItem = $(`#${id}`);
    this.printItemImageInPdf.emit({ jQItem, fg });
    this.staticImage.nativeElement.value = '';
  }

  private initForm() {
    this.checklistForm = this.createChecklistForm();
    this.updateValueAndValidityForm();
  }

  private createChecklistForm(): UntypedFormGroup {
    // console.log(this.templateChecklistItems);
    const checklistItems_CHECK: UntypedFormGroup[] = [];
    const checklistItems_TEXT: UntypedFormGroup[] = [];
    const checklistItems_SIGN: UntypedFormGroup[] = [];
    const checklistItems_IMAGE: UntypedFormGroup[] = [];
    if (this.templateChecklistItems?.length) {
      this.templateChecklistItems.forEach((item: TemplateChecklistItemDTO) => {
        switch (item.typeItem) {
          case 'CHECK':
            checklistItems_CHECK.push(this.createItemFormForPage(item, item.numPage, item.orderNumber, false));
            break;
          case 'TEXT':
            checklistItems_TEXT.push(this.createItemFormForPage(item, item.numPage, item.orderNumber, false));
            break;
          case 'SIGN':
            checklistItems_SIGN.push(this.createItemFormForPage(item, item.numPage, item.orderNumber, false));
            break;
          case 'IMAGE':
            checklistItems_IMAGE.push(this.createItemFormForPage(item, item.numPage, item.orderNumber, false));
            break;
        }
      });
    }
    return this.fb.group({
      templateChecklistItemsCheck: this.fb.array(checklistItems_CHECK),
      templateChecklistItemsText: this.fb.array(checklistItems_TEXT),
      templateChecklistItemsImage: this.fb.array(checklistItems_IMAGE),
      templateChecklistItemsSign: this.fb.array(checklistItems_SIGN)
    });
  }

  private createItemFormForPage(
    item: TemplateChecklistItemDTO,
    pageNumber: number | string,
    newOrderId: number,
    forceId = false
  ): UntypedFormGroup {
    return this.fb.group(
      {
        id: [item.id],
        numPage: [parseInt(`${pageNumber}`, 10), Validators.required],
        lowerLeftX: [item.lowerLeftX, Validators.required],
        lowerLeftY: [item.lowerLeftY, Validators.required],
        height: [item.height, Validators.required],
        width: [item.width, Validators.required],
        typeItem: [item.typeItem, Validators.required],
        typeSign: [item.typeSign],
        staticValue: [item.staticValue],
        defaultValue: [item.defaultValue],
        orderNumber: [newOrderId, Validators.required],
        label: [item.label, Validators.required],
        sincronizedItems: [item.sincronizedItems ? item.sincronizedItems : [newOrderId]],
        itemVal: this.fb.group({
          booleanValue: [item.itemVal?.booleanValue || item.itemVal?.booleanValue === false ? item.itemVal?.booleanValue : null],
          fileValue: this.fb.group({
            content: [
              item.itemVal?.fileValue?.content ? item.itemVal.fileValue.content : null,
              item.typeItem === 'SIGN' && item.typeSign === 'SIGN_CLIENT' ? Validators.required : null
            ],
            id: [item.itemVal?.fileValue?.id ? item.itemVal.fileValue.id : null],
            name: [item.itemVal?.fileValue?.name ? item.itemVal.fileValue.name : null],
            size: [item.itemVal?.fileValue?.size ? item.itemVal.fileValue.size : null],
            thumbnail: [item.itemVal?.fileValue?.thumbnail ? item.itemVal.fileValue.thumbnail : null],
            type: [item.itemVal?.fileValue?.type ? item.itemVal.fileValue.type : null]
          }),
          id: [item.itemVal?.id ? item.itemVal.id : null],
          textValue: [item.itemVal?.textValue ? item.itemVal.textValue : null]
        }),
        variable: [item.variable]
      },
      {
        validators: [
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('typeSign', [
            { control: 'typeItem', operation: 'equal', value: 'SIGN' }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('variable', [
            { control: 'typeItem', operation: 'equal', value: 'VARIABLE' }
          ])
        ]
      }
    );
  }

  private getImageAttachments(): void {
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
            .map((d: CardAttachmentsDTO) => {
              d.tabName = d.templateAttachmentItem.name;
              d.attachments = d.attachments.filter((a) => a.type.toLowerCase().indexOf('image') >= 0);
              // d.attachments.map((a) => {
              //   a.content = a.content ? a.content : a.thumbnail;
              //   return a;
              // });
              return d;
            })
            .filter((d: CardAttachmentsDTO) => d.attachments.length > 0);
        },
        error: (error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
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
}
