/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Input,
  EventEmitter,
  Output,
  HostListener,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import TemplatesChecklistsDTO, {
  AuxChecklistItemsGroupBySyncDTO,
  AuxChecklistItemsGroupByTypeDTO,
  SignDocumentExchangeDTO,
  TemplateChecklistItemDTO
} from '@data/models/templates/templates-checklists-dto';
import { TranslateService } from '@ngx-translate/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import $ from 'jquery';
import 'jqueryui';
import p5 from 'p5';
import { Subject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { SignDocumentAuxService } from './sign-document-aux.service';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { NGXLogger } from 'ngx-logger';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-sign-document-checklist-new',
  templateUrl: './sign-document-checklist-new.component.html',
  styleUrls: ['./sign-document-checklist-new.component.scss']
})
export class SignDocumentChecklistNewComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() wCardId: number;
  //En la firma remota bloqueamos el formulario
  @Input() mode: 'REMOTE' | 'NO_REMOTE' = 'NO_REMOTE';
  @Input() pdf: SignDocumentExchangeDTO;
  @Output() setTitle: EventEmitter<string> = new EventEmitter();
  @Output() saveAction: EventEmitter<SignDocumentExchangeDTO> = new EventEmitter();
  @ViewChild('staticImage')
  staticImage: ElementRef;
  @ViewChild('stepper') stepper: MatStepper;
  public currentStep = 0;
  public labels: any = {
    previous: marker('common.previous'),
    remoteSignaturePreview: marker('signature.previewStep'),
    remoteSignatureForm: marker('signature.formStep'),
    remoteSignatureDrawFieldForm: marker('signature.drawFieldFormStep'),
    remoteSignatureConfirmation: marker('signature.confirmationStep'),
    drawSignError: marker('signature.drawSignError'),
    itemsInTemplate: marker('administration.templates.checklists.itemsInTemplate'),
    insertTextHere: marker('common.insertTextHere'),
    pdfPreview: marker('administration.templates.checklists.pdfPreview'),
    uploadImage: marker('common.uploadImage'),
    loadingPdfWait: marker('administration.templates.checklists.loadingPdfWait'),
    text: marker('administration.templates.checklists.text'),
    sign: marker('administration.templates.checklists.sign'),
    signType: marker('administration.templates.checklists.signType'),
    SIGN_USER: marker('administration.templates.checklists.SIGN_USER'),
    SIGN_CLIENT: marker('administration.templates.checklists.SIGN_CLIENT'),
    drawing: marker('administration.templates.checklists.freeDraw'),
    check: marker('administration.templates.checklists.check'),
    variable: marker('administration.templates.checklists.var'),
    image: marker('administration.templates.checklists.image'),
    noData: marker('errors.noDataToShow'),
    pages: marker('pagination.pages'),
    items: marker('common.items'),
    showInPage: marker('common.showPage'),
    save: marker('common.save'),
    send: marker('common.send'),
    changeSign: marker('common.changeSign'),
    selectCardAttachmentImage: marker('administration.templates.checklists.selectCardAttachmentImage')
  };

  public itemToClone: JQuery<HTMLElement> = null;
  public smallModal = false;
  public signDocumentExchange: SignDocumentExchangeDTO;
  public page: number;
  public checklistForm: UntypedFormGroup;
  public fileTemplateBase64 = new Subject<any>();
  public pdfNumPages = 0;
  public pdfLoaded = false;
  public renderingDrawingItems = false;
  public pages: number[] = [];
  public itemListToShow: AuxChecklistItemsGroupByTypeDTO[] = [];
  public expansionPanelOpened: any = {};
  public auxOrderRelationRealOrder: any = {};
  public realOrderRelationAuxOrder: any = {};
  public selectedItemToUploadImage: number;
  public attachmentsByGroup: CardAttachmentsDTO[] = [];
  public showChangeSign = false;
  public changeSignToOrderNumber: number = null;
  private checklistToEdit: TemplatesChecklistsDTO = null;
  private formDataIdValueMapByPdf: { [fieldName: string]: string | number | boolean } = {};
  private formDataIdValueMapByForm: { [fieldName: string]: string | number | boolean } = {};
  private formDataIdValueMapByForNgxPdf: { [fieldName: string]: string | number | boolean } = {};
  private formDataIdValueMapByForNgxPdfToSend: { [fieldName: string]: string | number | boolean } = {};
  private p5s: { [auxOrderNumber: number]: p5 } = {};
  private p5sDraws: { [auxOrderNumber: number]: string } = {};
  private changeCounter = 0;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private signDocumentAuxService: SignDocumentAuxService,
    private router: Router,
    private templatesChecklistsService: TemplatesChecklistsService,
    private logger: NGXLogger
  ) {}

  public get formData(): { [fieldName: string]: string | number | boolean } {
    const templateChecklistItems: TemplateChecklistItemDTO[] = this.checklistForm?.get('templateChecklistItems').getRawValue();
    templateChecklistItems.forEach((item: TemplateChecklistItemDTO) => {
      if (item.typeItem === 'TEXT' && this.formDataIdValueMapByForm[item.auxOrderNumber] !== item.itemVal?.textValue) {
        item.sincronizedItems.forEach((auxOrderNumber) => {
          if (auxOrderNumber !== item.auxOrderNumber) {
            this.getChecklistItemByOrderNumber(auxOrderNumber)
              .get('itemVal')
              .get('textValue')
              .setValue(item.itemVal?.textValue ? item.itemVal.textValue : null);
          }
          this.formDataIdValueMapByForm[auxOrderNumber] = item.itemVal?.textValue ? item.itemVal?.textValue : null;
          this.formDataIdValueMapByForNgxPdf[`formData.item-${this.auxOrderRelationRealOrder[auxOrderNumber]}`] = item.itemVal
            ?.textValue
            ? item.itemVal?.textValue
            : null;
          this.changeCounter = 1;
        });
      } else if (item.typeItem === 'CHECK' && this.formDataIdValueMapByForm[item.auxOrderNumber] !== item.itemVal?.booleanValue) {
        item.sincronizedItems.forEach((auxOrderNumber) => {
          if (auxOrderNumber !== item.auxOrderNumber) {
            this.getChecklistItemByOrderNumber(auxOrderNumber)
              .get('itemVal')
              .get('booleanValue')
              .setValue(item.itemVal?.booleanValue ? true : null);
          }
          this.formDataIdValueMapByForm[auxOrderNumber] = item.itemVal?.booleanValue ? true : null;
          this.formDataIdValueMapByForNgxPdf[`formData.item-${this.auxOrderRelationRealOrder[auxOrderNumber]}`] = item.itemVal
            ?.booleanValue
            ? 'Yes'
            : null;
          this.changeCounter = 1;
        });
      }
    });
    if (this.changeCounter > 0) {
      this.changeCounter--;
      this.formDataIdValueMapByForNgxPdfToSend = { ...this.formDataIdValueMapByForNgxPdf };
      // return { ...this.formDataIdValueMapByForNgxPdf };
      // return this.formDataIdValueMapByForNgxPdf;
    }
    // return this.formDataIdValueMapByForNgxPdf;
    return this.formDataIdValueMapByForNgxPdfToSend;
  }

  public set formData(data: { [fieldName: string]: string | number | boolean }) {
    Object.keys(data).forEach((k) => {
      if (k.indexOf('formData.item-') === 0) {
        const auxOrder = this.realOrderRelationAuxOrder[parseInt(k.split('formData.item-')[1].split('/')[0], 10)];
        const fgAux = this.getChecklistItemByOrderNumber(auxOrder);
        if (fgAux.get('typeItem').value === 'TEXT' && this.mode === 'NO_REMOTE') {
          this.formDataIdValueMapByPdf[auxOrder] = data[k];
        } else if (fgAux.get('typeItem').value === 'CHECK' && this.mode === 'NO_REMOTE') {
          this.formDataIdValueMapByPdf[auxOrder] = data[k] === 'Yes' ? true : null;
        }
        if (this.formDataIdValueMapByPdf[auxOrder] !== this.formDataIdValueMapByForm[auxOrder]) {
          this.getChecklistItemByOrderNumber(auxOrder)
            .get('sincronizedItems')
            .value.forEach((n: number) => {
              const fg = this.getChecklistItemByOrderNumber(n);
              if (fg.get('typeItem').value === 'TEXT' && this.mode === 'NO_REMOTE') {
                fg.get('itemVal').get('textValue').setValue(data[k]);
                this.formDataIdValueMapByPdf[n] = data[k];
              } else if (fg.get('typeItem').value === 'CHECK' && this.mode === 'NO_REMOTE') {
                fg.get('itemVal')
                  .get('booleanValue')
                  .setValue(data[k] ? true : null);
                this.formDataIdValueMapByPdf[n] = data[k] === 'Yes' ? true : null;
              }
            });
        }
      }
    });
    this.updateValueAndValidityForm();
    // this.repaintItemsInTemplate();
  }

  ngOnInit(): void {
    this.getImageAttachments();
    this.preparePdf();
  }

  ngAfterViewInit(): void {
    this.itemToClone = $(`#checklistItemToDrag`);
  }

  ngOnDestroy(): void {
    this.removeP5s(true);
  }

  public getPdfMinHeight(): string {
    if (this.smallModal) {
      return '75vh';
    }
    return 'auto';
  }

  public setItemListToShow(): void {
    const items: TemplateChecklistItemDTO[] = this.checklistForm?.get('templateChecklistItems').getRawValue();
    const groupByType: AuxChecklistItemsGroupByTypeDTO[] = [];
    items.forEach((item: TemplateChecklistItemDTO, index) => {
      const group = groupByType.find((g: AuxChecklistItemsGroupByTypeDTO) => g.typeItem === item.typeItem);
      if (group) {
        if (group.numPages.indexOf(item.numPage) === -1) {
          group.numPages.push(item.numPage);
        }
        group.orderNumbers.push(item.auxOrderNumber);
        group.orderNumberPageAssociation[item.auxOrderNumber] = item.numPage;
        group.numPages.sort();
        //Comprobamos si ya está asignado a otro grupo
        const syncGroupFound = group.syncGroups.find((g: AuxChecklistItemsGroupBySyncDTO) => {
          return g.sincronizedItems.indexOf(item.auxOrderNumber) >= 0;
        });
        if (syncGroupFound) {
          (syncGroupFound.templateChecklistItems as UntypedFormArray).push(
            (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).at(index)
          );
        } else {
          group.syncGroups.push({
            numPages: [item.numPage],
            sincronizedItems: item.sincronizedItems?.length ? item.sincronizedItems : [item.auxOrderNumber],
            selectedItem: item.auxOrderNumber,
            typeItem: item.typeItem,
            typeSign: item.typeSign,
            variable: item.variable,
            syncronized: false,
            templateChecklistItems: this.fb.array([
              (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).at(index)
            ])
          });
        }
      } else {
        const orderNumberPageAssociation: any = {};
        orderNumberPageAssociation[item.auxOrderNumber] = item.numPage;
        groupByType.push({
          typeItem: item.typeItem,
          typeLabel: this.translateService.instant(this.labels[item.typeItem.toLowerCase()]),
          numPages: [item.numPage],
          orderNumbers: [item.auxOrderNumber],
          orderNumberPageAssociation,
          syncGroups: [
            {
              numPages: [item.numPage],
              sincronizedItems: item.sincronizedItems?.length ? item.sincronizedItems : [item.auxOrderNumber],
              selectedItem: item.auxOrderNumber,
              typeItem: item.typeItem,
              typeSign: item.typeSign,
              variable: item.variable,
              syncronized: false,
              templateChecklistItems: this.fb.array([
                (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).at(index)
              ])
            }
          ]
        });
      }
    });
    this.itemListToShow = groupByType;
  }

  public addStaticImage(item: FileList): void {
    this.getImageFile(item, this.selectedItemToUploadImage);
  }

  public imageAttachmentSelected(event: { value: AttachmentDTO }, selectedItemToUploadImage: number) {
    const file: AttachmentDTO = event.value;
    const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(selectedItemToUploadImage);
    fg.get('itemVal')
      .get('fileValue')
      .get('id')
      .setValue(file.id ? file.id : null);
    fg.get('itemVal')
      .get('fileValue')
      .get('name')
      .setValue(file?.name ? file.name : null);
    fg.get('itemVal')
      .get('fileValue')
      .get('type')
      .setValue(file?.type ? file.type : null);
    fg.get('itemVal')
      .get('fileValue')
      .get('size')
      .setValue(file?.size ? file.size : null);
    fg.get('itemVal')
      .get('fileValue')
      .get('content')
      .setValue(file?.content ? file.content : null, { emit: true });
    fg.get('itemVal')
      .get('fileValue')
      .get('thumbnail')
      .setValue(file?.thumbnail ? file.thumbnail : null, { emit: true });
    this.updateValueAndValidityForm();

    const id = `item_${selectedItemToUploadImage}`;
    const jQItem = $(`#${id}`);
    this.printItemImageInPdf(jQItem, fg);
  }

  public getImagePreviewBase64(itemOrderNumber: number): string {
    const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(itemOrderNumber);
    if (
      fg?.get('itemVal')?.get('fileValue')?.get('type')?.value &&
      (fg?.get('itemVal')?.get('fileValue')?.get('content')?.value ||
        fg?.get('itemVal')?.get('fileValue')?.get('thumbnail')?.value)
    ) {
      return `data:${fg.get('itemVal').get('fileValue').get('type').value};base64,${
        fg.get('itemVal').get('fileValue').get('content').value
          ? fg.get('itemVal').get('fileValue').get('content').value
          : fg?.get('itemVal')?.get('fileValue')?.get('thumbnail')?.value
      }`;
    }
    return '';
  }

  public pdfLoadedFn($event: any) {
    this.pdfNumPages = $event.pagesCount;
    this.pages = [...Array(this.pdfNumPages).keys()].map((x) => ++x);
    this.pdfLoaded = true;
  }

  //Method to change the page manually
  public changePage(page: number) {
    if (page && this.page !== page) {
      this.page = page;
    }
  }

  public pdfZoomChange($event: any): void {
    this.removeP5s();
  }

  public pageRendered(event: { pageNumber: number }): void {
    // console.log('page rendered', event);
    this.configCanvas(event.pageNumber);
  }

  public repaintItemsInTemplate(page?: number): void {
    if (this.checklistForm?.value?.templateChecklistItems?.length > 0) {
      this.checklistForm.value.templateChecklistItems.forEach((item: TemplateChecklistItemDTO, index: number) => {
        if (page && item.numPage === page) {
          this.printItemInPdfPage(
            (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).at(index) as UntypedFormGroup
          );
        } else if (!page) {
          this.printItemInPdfPage(
            (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).at(index) as UntypedFormGroup
          );
        }
      });
    } else {
      this.renderingDrawingItems = false;
    }
  }

  public configCanvas(pgNumber?: number): void {
    if (this.pdfLoaded) {
      const arr = document.getElementById('checklistPDF')?.getElementsByClassName('page');
      if (arr) {
        Array.from(arr).forEach((page: Element) => {
          const pageNumber = page.getAttribute('data-page-number');
          const loaded = page.getAttribute('data-loaded');
          if (loaded && document.getElementsByClassName('canvasDropZone-page' + pageNumber).length === 0) {
            const canvas = page.getElementsByClassName('canvasWrapper').item(0); //.getElementsByTagName('canvas').item(0);
            canvas.classList.add('canvasDropZone-page' + pageNumber);
          }
        });
      }
    }
    this.repaintItemsInTemplate(pgNumber ? pgNumber : null);
  }

  public getChecklistItemByOrderNumber(ordNumber: number): UntypedFormGroup {
    let fg: UntypedFormGroup = null;
    if (ordNumber && this.checklistForm.get('templateChecklistItems')) {
      (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).controls.forEach((form: UntypedFormGroup) => {
        if (form.get('auxOrderNumber').value === ordNumber) {
          fg = form;
          return fg;
        }
      });
    }
    return fg;
  }

  public getLabelForOrderNumber(ordNumber: number): string {
    return this.getChecklistItemByOrderNumber(ordNumber)?.get('label').value;
  }

  public updateValueAndValidityForm(): void {
    this.checklistForm.get('templateChecklistItems').updateValueAndValidity();
    this.checklistForm.updateValueAndValidity();
  }

  public getSyncGroupLabel(syncGroup: AuxChecklistItemsGroupBySyncDTO): string {
    let str = '';
    const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(syncGroup.selectedItem);
    if (fg.get('typeItem').value === 'SIGN' && fg.get('typeSign').value) {
      str = this.translateService.instant(this.labels[fg.get('typeSign').value]);
    }
    if (fg.get('label').value) {
      str += str
        ? `: ${this.getChecklistItemByOrderNumber(syncGroup.selectedItem)?.get('label').value}`
        : this.getChecklistItemByOrderNumber(syncGroup.selectedItem)?.get('label').value;
    }
    return str;
  }

  public cancel(): void {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.CHECKLISTS]);
        }
      });
  }

  public isSaveDisabled(): boolean {
    if (!this.checklistForm) {
      return true;
    }
    this.updateValueAndValidityForm();
    return this.checklistForm.invalid;
  }

  public getErrorMessages(): string[] {
    if (!this.checklistForm) {
      return [];
    }
    const errores = [];
    if (this.checklistForm.invalid) {
      if (this.checklistForm.get('templateFile').invalid) {
        errores.push(this.translateService.instant(marker('administration.templates.checklists.templateFileError')));
      }
      if (this.checklistForm.get('template').invalid) {
        errores.push(this.translateService.instant(marker('administration.templates.checklists.configError')));
      }
      if (this.checklistForm.get('templateChecklistItems').invalid) {
        const itemsWithErrors: number[] = [];
        (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).controls.forEach((fg: UntypedFormGroup) => {
          if (fg.invalid) {
            itemsWithErrors.push(fg.get('auxOrderNumber').value);
          }
        });
        const items = itemsWithErrors.join(', ');
        errores.push(
          this.translateService.instant(marker('administration.templates.checklists.itemsConfigError'), {
            items: itemsWithErrors.join(', ')
          })
        );
      }
    }
    return errores;
  }

  public save(): void {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.askForConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const itemsModified = this.checklistForm.getRawValue().templateChecklistItems;
          this.signDocumentExchange.templateChecklist.templateChecklistItems.forEach((item: TemplateChecklistItemDTO) => {
            const found = itemsModified.find((aux: TemplateChecklistItemDTO) => aux.orderNumber === item.orderNumber);
            if (found) {
              item.itemVal = found.itemVal;
              // DGDC: Evitamos esta forma de hacerlo ya que en IOS v 15 falla.
              // if (item.typeItem === 'DRAWING' && this.p5sDraws[found.auxOrderNumber]) {
              //   item.itemVal.fileValue.content = this.p5sDraws[found.auxOrderNumber].split(';base64,')[1];
              //   item.itemVal.fileValue.type = this.p5sDraws[found.auxOrderNumber].split(';base64,')[0].split('data:')[1];
              //   item.itemVal.fileValue.name = `${+new Date()}_draw.png`;
              if (item.typeItem === 'DRAWING' && this.p5s[found.auxOrderNumber]) {
                try {
                  // DGDC: Evitamos esta forma de hacerlo ya que en IOS v 15 falla.
                  // const { canvas } = this.p5s[found.auxOrderNumber].get() as unknown as {
                  //   canvas: HTMLCanvasElement;
                  // };
                  const domItem = document.getElementById('item_' + found.auxOrderNumber);
                  const canvas = domItem.querySelector('canvas.p5Canvas') as HTMLCanvasElement;
                  const dataUrl = canvas.toDataURL();

                  item.itemVal.fileValue.content = dataUrl.split(';base64,')[1];
                  item.itemVal.fileValue.type = dataUrl.split(';base64,')[0].split('data:')[1];
                  item.itemVal.fileValue.name = `${+new Date()}_draw.png`;
                } catch (error) {
                  console.error('Save', error);
                }
              } else {
                item.itemVal.fileValue =
                  item.itemVal.fileValue.content || (item.itemVal.fileValue.id && item.itemVal.fileValue.thumbnail)
                    ? item.itemVal.fileValue
                    : null;
              }
              if (
                item.itemVal?.fileValue?.content &&
                item.typeItem === 'SIGN' &&
                item.sincronizedItems?.length > 1 &&
                item.sincronizedItems?.indexOf(item.orderNumber) > 0
              ) {
                item.itemVal.fileValue = null;
              }
            }
          });
          this.saveAction.emit(this.signDocumentExchange);
        }
      });
  }

  public changeSign(auxOrderNumber: number): void {
    this.changeSignToOrderNumber = auxOrderNumber;
    this.showChangeSign = true;
  }

  public changeSignAction(dataUrl: string): void {
    const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(this.changeSignToOrderNumber);
    fg.get('sincronizedItems').value.forEach((n: number) => {
      const fgAux: UntypedFormGroup = this.getChecklistItemByOrderNumber(n);
      fgAux.get('itemVal').get('fileValue').get('id').setValue(null);
      fgAux.get('itemVal').get('fileValue').get('name').setValue(`${+new Date()}_sign.png`);
      fgAux.get('itemVal').get('fileValue').get('type').setValue(dataUrl.split('data:')[1].split(';base64')[0]);
      fgAux.get('itemVal').get('fileValue').get('size').setValue(null);
      fgAux.get('itemVal').get('fileValue').get('content').setValue(dataUrl.split(';base64,')[1]);
    });
    this.showChangeSign = false;
    this.updateValueAndValidityForm();

    fg.get('sincronizedItems').value.forEach((n: number) => {
      const id = `item_${n}`;
      const jQItem = $(`#${id}`);
      this.printItemImageInPdf(jQItem, this.getChecklistItemByOrderNumber(n));
    });
  }

  public getNextStepLabel(): string {
    // if (this.stepper?.selectedIndex === 2 && this.finalRemoteSignDocumentPreview.userCustomerReducedDTO.hasPass) {
    //   return marker('common.sign');
    // } else if (this.stepper?.selectedIndex === 2 && !this.finalRemoteSignDocumentPreview.userCustomerReducedDTO.hasPass) {
    //   return marker('signature.askForCode.title');
    // }
    return marker('signature.nextStep');
  }

  //Private methods

  private initForm() {
    this.checklistForm = this.signDocumentAuxService.createChecklistForm(this.checklistToEdit, []);
    if (this.mode === 'REMOTE') {
      this.checklistForm.disable();
    }
    this.updateValueAndValidityForm();
  }

  private printItemImageInPdf(jItem: JQuery<HTMLElement>, templateItemFG: UntypedFormGroup): void {
    const item: TemplateChecklistItemDTO = templateItemFG.getRawValue();
    if (
      (item.typeItem === 'IMAGE' || item.typeItem === 'SIGN') &&
      (item.itemVal.fileValue.content || item.itemVal.fileValue.thumbnail)
    ) {
      jItem.css({
        'background-repeat': 'no-repeat',
        'background-position': 'left bottom',
        'background-size': 'contain',
        'background-image': `url("data:${item.itemVal.fileValue.type};base64,${
          item.itemVal.fileValue.content ? item.itemVal.fileValue.content : item.itemVal.fileValue.thumbnail
        }")`
      });
    }
  }

  private printItemInPdfPage(templateItemFG: UntypedFormGroup): void {
    const pageWidthAndHeight = this.signDocumentAuxService.getPageWidthAndHeight(`${templateItemFG.get('numPage').value}`);
    const pageNumber = `${templateItemFG.get('numPage').value}`;
    const uniqueId = templateItemFG.get('auxOrderNumber').value;
    const id = `item_${uniqueId}`;
    const id_resizable = `item_resizable_${uniqueId}`;
    let item: JQuery<HTMLElement> = null;
    if ($(`#${id}`).length) {
      item = $(`#${id}`);
      item.css({
        top: (pageWidthAndHeight.height * templateItemFG.get('lowerLeftY').value) / 100 + 'px',
        left: (pageWidthAndHeight.width * templateItemFG.get('lowerLeftX').value) / 100 + 'px'
      });
      item.children().css({
        width: (pageWidthAndHeight.width * templateItemFG.get('width').value) / 100 + 'px',
        height: (pageWidthAndHeight.height * templateItemFG.get('height').value) / 100 + 'px'
      });
    } else {
      item = this.itemToClone.clone();
      item.removeClass('undropped');
      item.addClass('dropped');
      item.attr('id', id);
      item.attr('data-id', uniqueId);
      item
        .children('.resizable')
        .children('.checklistItemToDrag__label')
        .prepend(`<div class="checklistItemToDrag__orderNumber">${uniqueId}</div> `);
      item.children('.resizable').attr('id', id_resizable);
      item.children('.resizable').attr('data-id', uniqueId);
      item.css({
        top: (pageWidthAndHeight.height * templateItemFG.get('lowerLeftY').value) / 100 + 'px',
        left: (pageWidthAndHeight.width * templateItemFG.get('lowerLeftX').value) / 100 + 'px'
      });
      item.children().css({
        width: (pageWidthAndHeight.width * templateItemFG.get('width').value) / 100 + 'px',
        height: (pageWidthAndHeight.height * templateItemFG.get('height').value) / 100 + 'px'
      });
      item.appendTo($('.canvasDropZone-page' + pageNumber));
    }
    this.printItemImageInPdf(item, templateItemFG);
    if (templateItemFG.get('typeItem').value === 'DRAWING' && !this.p5s[uniqueId] && $(`#${id_resizable}`).length) {
      new p5((p: p5) =>
        this.setDrawZone(
          p,
          uniqueId,
          id,
          id_resizable,
          item,
          (pageWidthAndHeight.width * templateItemFG.get('width').value) / 100,
          (pageWidthAndHeight.height * templateItemFG.get('height').value) / 100
        )
      );
    }
  }

  private setDrawZone = (
    p: p5,
    auxOrderNumber: number,
    id: string,
    id_resizable: string,
    item: JQuery<HTMLElement>,
    width: number,
    height: number
  ): void => {
    if (item.length && this.mode !== 'REMOTE') {
      item.css({
        'z-index': 1000,
        'touch-action': 'none'
      });
      p.setup = () => {
        p.createCanvas(width, height).parent(id_resizable);
      };
      if (this.p5sDraws[auxOrderNumber]) {
        this.renderingDrawingItems = true;
        p.loadImage(this.p5sDraws[auxOrderNumber], (newImage) => {
          p.clear(255, 255, 255, 1);
          p.image(newImage, 0, 0, p.width, p.height);

          this.renderingDrawingItems = false;
        });
      }
      p.touchMoved = (event: any) => {
        try {
          console.log(event);
          if (event?.touches?.length > 1 || event?.targetTouches?.length > 1) {
            return;
          }
          let type = 'pencil';
          if ($('#sign-document-pen-eraser:checked').length) {
            type = 'eraser';
          }
          const size = parseInt($('#sign-document-pen-size').val().toString(), 10);
          const color = $('#sign-document-pen-color').val().toString();
          p.fill(color);
          p.stroke(color);
          if (type === 'eraser') {
            p.erase();
            p.strokeWeight(30);
            p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
          } else {
            p.noErase();
            if (type === 'pencil') {
              p.strokeWeight(size);
              p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
            } else {
              p.ellipse(p.mouseX, p.mouseY, size, size);
            }
          }
        } catch (error) {
          console.error('touchMoved', error);
        }
      };
      p.touchEnded = (event: TouchEvent, paux: p5 = p) => {
        try {
          // DGDC: Evitamos esta forma de hacerlo ya que en IOS v 15 falla.
          // const { canvas } = paux.get() as unknown as {
          //   canvas: HTMLCanvasElement;
          // };
          const domItem = document.getElementById('item_' + auxOrderNumber);
          const canvas = domItem.querySelector('canvas.p5Canvas') as HTMLCanvasElement;
          if (!canvas?.toDataURL || !canvas.toDataURL()) {
            return;
          }
          const dataURL = canvas.toDataURL();
          this.p5sDraws[auxOrderNumber] = dataURL;
        } catch (error) {
          console.error('touchEnded', error);
        }
      };
      this.p5s[auxOrderNumber] = p;
    }
  };

  private getBase64(file: File): Promise<any> {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (ev) => {
        resolve(ev.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  private async getImageFile(files: FileList, itemOrderNumber: number): Promise<void> {
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
    const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(itemOrderNumber);
    fg.get('itemVal').get('fileValue').get('id').setValue(null);
    fg.get('itemVal').get('fileValue').get('name').setValue(file.name);
    fg.get('itemVal').get('fileValue').get('type').setValue(file.type);
    fg.get('itemVal').get('fileValue').get('size').setValue(file.size);
    fg.get('itemVal').get('fileValue').get('content').setValue(base64.split(';base64,')[1], { emit: true });
    this.checklistForm.markAsDirty();
    this.checklistForm.markAsTouched();
    const id = `item_${itemOrderNumber}`;
    const jQItem = $(`#${id}`);
    this.printItemImageInPdf(jQItem, fg);
    this.staticImage.nativeElement.value = '';
  }

  private preparePdf(): void {
    const spinner = this.spinnerService.show();
    this.templatesChecklistsService
      .signDocument(this.wCardId, this.pdf)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data) => {
          this.signDocumentExchange = data;
          this.checklistToEdit = { ...this.signDocumentExchange.templateChecklist };
          this.checklistToEdit.templateChecklistItems = [...this.checklistToEdit.templateChecklistItems].filter((item) => {
            if (item.staticValue) {
              return false;
            } else if (item.typeItem === 'VARIABLE') {
              return false;
            }
            return true;
          });
          this.checklistToEdit.templateChecklistItems
            .sort((a, b) => a.orderNumber - b.orderNumber)
            .forEach((item, index) => {
              item.auxOrderNumber = index + 1;
              this.auxOrderRelationRealOrder[item.auxOrderNumber] = item.orderNumber;
              this.realOrderRelationAuxOrder[item.orderNumber] = item.auxOrderNumber;
            });
          this.checklistToEdit.templateChecklistItems.forEach((item) => {
            item.auxSincronizedItems = item.sincronizedItems
              ? [...item.sincronizedItems].map((n) => this.realOrderRelationAuxOrder[n])
              : item.sincronizedItems;
          });
          this.setTitle.emit(this.signDocumentExchange.templateChecklist.templateFile.name);
          this.fileTemplateBase64.next(data.procesedFile.content);
          this.initForm();
          this.setItemListToShow();
          this.repaintItemsInTemplate();
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
            .map((d) => {
              d.tabName = d.templateAttachmentItem.name;
              d.attachments = d.attachments.filter((a) => a.type.toLowerCase().indexOf('image') >= 0);
              // d.attachments.map((a) => {
              //   a.content = a.content ? a.content : a.thumbnail;
              //   return a;
              // });
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

  private removeP5s(removeDraws?: boolean): void {
    Object.keys(this.p5s).forEach((k) => {
      const p5Canvas = this.p5s[parseInt(k, 10)];
      p5Canvas.touchMoved = (event) => {};
      p5Canvas.touchEnded = (event) => {};
      p5Canvas.remove();
      this.p5s[parseInt(k, 10)] = null;
    });
    this.p5s = [];
    $('.p5Canvas').remove();
    if (removeDraws) {
      this.p5sDraws = {};
    }
  }
}
