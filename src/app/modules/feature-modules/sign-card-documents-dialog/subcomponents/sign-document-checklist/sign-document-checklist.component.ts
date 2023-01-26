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
  ViewEncapsulation
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
import { Subject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { SignDocumentAuxService } from './sign-document-aux.service';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { ConcenetError } from '@app/types/error';
import { NGXLogger } from 'ngx-logger';
import { MatExpansionPanel } from '@angular/material/expansion';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { CustomDialogService } from '@jenga/custom-dialog';
import {
  InsertSignComponentModalEnum,
  ModalInsertSignComponent
} from '@modules/feature-modules/modal-insert-sign/modal-insert-sign.component';

@Component({
  selector: 'app-sign-document-checklist',
  templateUrl: './sign-document-checklist.component.html',
  styleUrls: ['./sign-document-checklist.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignDocumentChecklistComponent implements OnInit, AfterViewInit {
  @Input() wCardId: number;
  @Input() pdf: SignDocumentExchangeDTO;
  @Output() setTitle: EventEmitter<string> = new EventEmitter();
  @ViewChild('staticImage')
  staticImage: ElementRef;
  @ViewChild('fieldsPanel')
  fieldsPanel: MatExpansionPanel;
  public smallModal = false;
  public signDocumentExchange: SignDocumentExchangeDTO;
  public page: number;
  public checklistForm: UntypedFormGroup;
  public fileTemplateBase64 = new Subject<any>();
  public pdfNumPages = 0;
  public pdfLoaded = false;
  public renderingItems = true;
  public pages: number[] = [];
  public itemListToShow: AuxChecklistItemsGroupByTypeDTO[] = [];
  public expansionPanelOpened: any = {};
  public auxOrderRelationRealOrder: any = {};
  public realOrderRelationAuxOrder: any = {};
  public selectedItemToUploadImage: number;
  public attachmentsByGroup: CardAttachmentsDTO[] = [];
  public labels: any = {
    newCheckList: marker('administration.templates.checklists.new'),
    cheklistConfig: marker('administration.templates.checklists.config'),
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
    name: marker('administration.templates.checklists.name'),
    nameRequired: marker('userProfile.nameRequired'),
    includeFile: marker('administration.templates.checklists.includeFile'),
    dropHere: marker('administration.templates.checklists.dropHere'),
    noData: marker('errors.noDataToShow'),
    pages: marker('pagination.pages'),
    fieldsType: marker('common.fieldsType'),
    items: marker('common.items'),
    showInPage: marker('common.showPage'),
    label: marker('common.label'),
    deleteFile: marker('common.deleteFile'),
    syncronization: marker('administration.templates.checklists.syncronization'),
    copyItemInPage: marker('administration.templates.checklists.copyItemInPage'),
    cancel: marker('common.cancel'),
    save: marker('common.save'),
    changeSign: marker('common.changeSign'),
    staticValue: marker('administration.templates.checklists.staticValue'),
    staticValueInput: marker('administration.templates.checklists.staticValueInput'),
    staticValueImage: marker('administration.templates.checklists.staticValueImage'),
    selectCardAttachmentImage: marker('administration.templates.checklists.selectCardAttachmentImage')
  };
  private checklistToEdit: TemplatesChecklistsDTO = null;
  private formDataIdValueMapByPdf: { [fieldName: string]: string | number | boolean } = {};
  private formDataIdValueMapByForm: { [fieldName: string]: string | number | boolean } = {};
  private formDataIdValueMapByForNgxPdf: { [fieldName: string]: string | number | boolean } = {};

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private signDocumentAuxService: SignDocumentAuxService,
    private router: Router,
    private templatesChecklistsService: TemplatesChecklistsService,
    private logger: NGXLogger,
    private customDialogService: CustomDialogService
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
        });
      }
    });
    return { ...this.formDataIdValueMapByForNgxPdf };
  }

  public set formData(data: { [fieldName: string]: string | number | boolean }) {
    Object.keys(data).forEach((k) => {
      if (k.indexOf('formData.item-') === 0) {
        const auxOrder = this.realOrderRelationAuxOrder[parseInt(k.split('formData.item-')[1].split('/')[0], 10)];
        const fgAux = this.getChecklistItemByOrderNumber(auxOrder);
        if (fgAux.get('typeItem').value === 'TEXT') {
          this.formDataIdValueMapByPdf[auxOrder] = data[k];
        } else if (fgAux.get('typeItem').value === 'CHECK') {
          this.formDataIdValueMapByPdf[auxOrder] = data[k] === 'Yes' ? true : null;
        }
        if (this.formDataIdValueMapByPdf[auxOrder] !== this.formDataIdValueMapByForm[auxOrder]) {
          this.getChecklistItemByOrderNumber(auxOrder)
            .get('sincronizedItems')
            .value.forEach((n: number) => {
              const fg = this.getChecklistItemByOrderNumber(n);
              if (fg.get('typeItem').value === 'TEXT') {
                fg.get('itemVal').get('textValue').setValue(data[k]);
                this.formDataIdValueMapByPdf[n] = data[k];
              } else if (fg.get('typeItem').value === 'CHECK') {
                fg.get('itemVal')
                  .get('booleanValue')
                  .setValue(data[k] === 'Yes' ? true : null);
                this.formDataIdValueMapByPdf[n] = data[k] === 'Yes' ? true : null;
              }
            });
        }
      }
    });
    this.updateValueAndValidityForm();
    this.repaintItemsInTemplate();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize(window.innerWidth);
  }

  ngOnInit(): void {
    this.getImageAttachments();
    this.preparePdf();
  }

  ngAfterViewInit(): void {
    this.checkWindowSize(window.innerWidth);
  }

  public checkWindowSize(width: number): void {
    if (width < 1000) {
      this.smallModal = true;
    } else {
      this.smallModal = false;
      this.fieldsPanel.open();
    }
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
    fg.get('itemVal').get('fileValue').get('id').setValue(null);
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
    this.updateValueAndValidityForm();
    this.repaintItemsInTemplate();
  }

  public getImagePreviewBase64(itemOrderNumber: number): string {
    const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(itemOrderNumber);
    if (fg?.get('itemVal')?.get('fileValue')?.get('type')?.value && fg?.get('itemVal')?.get('fileValue')?.get('content')?.value) {
      return `data:${fg.get('itemVal').get('fileValue').get('type').value};base64,${
        fg.get('itemVal').get('fileValue').get('content').value
      }`;
    }
    return '';
  }

  public pdfZoomChange($event: any) {
    this.configCanvas();
  }

  public refreshItemsAndPdf(): void {
    this.setItemListToShow();
    this.repaintItemsInTemplate();
  }

  public repaintItemsInTemplate(page?: number): void {
    if (this.checklistForm?.value?.templateChecklistItems?.length > 0) {
      setTimeout(() => {
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
      });
    } else {
      this.renderingItems = false;
    }
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

  public configCanvas($event?: any): void {
    // console.log('config canvas', $event);
    if (this.pdfLoaded) {
      this.renderingItems = true;
      Array.from(document.getElementById('checklistPDF').getElementsByClassName('page')).forEach((page: Element) => {
        const pageNumber = page.getAttribute('data-page-number');
        const loaded = page.getAttribute('data-loaded');
        if (loaded && $('.canvasDropZone-page' + pageNumber).length === 0) {
          const canvas = page.getElementsByClassName('canvasWrapper').item(0); //.getElementsByTagName('canvas').item(0);
          canvas.classList.add('canvasDropZone-page' + pageNumber);
        }
      });
    }
    setTimeout(() => this.repaintItemsInTemplate());
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
          const spinner = this.spinnerService.show();
          const data: any = this.checklistForm.getRawValue();
          const template: any = data.template;
          template.brands = template.brands.map((item: any) => {
            return { id: item.id };
          });
          template.departments = template.departments.map((item: any) => {
            return { id: item.id };
          });
          template.facilities = template.facilities.map((item: any) => {
            return { id: item.id };
          });
          template.specialties = template.specialties.map((item: any) => {
            return { id: item.id };
          });
          data.template = template;
          data.templateChecklistItems.map((item: any) => {
            item.sincronizedItems =
              item.sincronizedItems.length === 1 || item.staticValue
                ? null
                : [...item.sincronizedItems].map((n) => this.auxOrderRelationRealOrder[n]);
            if (item.typeItem === 'VARIABLE') {
              item.variable = { id: item.variable.id };
            }
            if (item.staticValue && item.typeItem !== 'SIGN' && item.typeItem !== 'DRAWING' && item.typeItem !== 'IMAGE') {
              item.itemVal.fileValue = null;
            } else if (!item.staticValue) {
              item.itemVal = null;
            }
            return item;
          });
          this.templatesChecklistsService
            .addOrEditChecklist(data)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.CHECKLISTS]);
              },
              error: (error: ConcenetError) => {
                this.globalMessageService.showError({
                  message: this.translateService.instant(error.message),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }

  public changeSign(auxOrderNumber: number): void {
    this.customDialogService
      .open({
        id: InsertSignComponentModalEnum.ID,
        panelClass: InsertSignComponentModalEnum.PANEL_CLASS,
        component: ModalInsertSignComponent,
        disableClose: true,
        width: '95%',
        maxWidth: '550px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(auxOrderNumber);
          fg.get('itemVal').get('fileValue').get('id').setValue(null);
          fg.get('itemVal').get('fileValue').get('name').setValue(`${+new Date()}_sign.png`);
          fg.get('itemVal').get('fileValue').get('type').setValue(response.split('data:')[1].split(';base64')[0]);
          fg.get('itemVal').get('fileValue').get('size').setValue(null);
          fg.get('itemVal').get('fileValue').get('content').setValue(response.split(';base64,')[1], { emit: true });
          this.updateValueAndValidityForm();
          this.repaintItemsInTemplate();
        }
      });
  }

  //Private methods

  private initForm() {
    this.checklistForm = this.signDocumentAuxService.createChecklistForm(this.checklistToEdit, []);
    this.updateValueAndValidityForm();
  }

  private printItemImageInPdf(jItem: JQuery<HTMLElement>, templateItemFG: UntypedFormGroup): void {
    const item: TemplateChecklistItemDTO = templateItemFG.getRawValue();
    if ((item.typeItem === 'IMAGE' || item.typeItem === 'SIGN') && item.itemVal.fileValue.content) {
      jItem.css({
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'contain',
        'background-image': `url("data:${item.itemVal.fileValue.type};base64,${item.itemVal.fileValue.content}")`
      });
    }
  }

  private printItemInPdfPage(templateItemFG: UntypedFormGroup): void {
    const item = $(`#checklistItemToDrag`);
    const pageWidthAndHeight = this.signDocumentAuxService.getPageWidthAndHeight(`${templateItemFG.get('numPage').value}`);
    const pageNumber = `${templateItemFG.get('numPage').value}`;
    const uniqueId = templateItemFG.get('auxOrderNumber').value;
    const id = `item_${uniqueId}`;
    if ($(`#${id}`).length) {
      const newItem = $(`#${id}`);
      newItem.css({
        top: (pageWidthAndHeight.height * templateItemFG.get('lowerLeftY').value) / 100 + 'px',
        left: (pageWidthAndHeight.width * templateItemFG.get('lowerLeftX').value) / 100 + 'px'
      });
      newItem.children().css({
        width: (pageWidthAndHeight.width * templateItemFG.get('width').value) / 100 + 'px',
        height: (pageWidthAndHeight.height * templateItemFG.get('height').value) / 100 + 'px'
      });
      this.printItemImageInPdf(newItem, templateItemFG);
    } else {
      const newItem = item.clone();
      newItem.removeClass('undropped');
      newItem.addClass('dropped');
      newItem.attr('id', id);
      newItem.attr('data-id', uniqueId);
      newItem
        .children('.resizable')
        .children('.checklistItemToDrag__label')
        .prepend(`<div class="checklistItemToDrag__orderNumber">${uniqueId}</div> `);
      newItem.children('.resizable').attr('data-id', uniqueId);
      newItem.css({
        top: (pageWidthAndHeight.height * templateItemFG.get('lowerLeftY').value) / 100 + 'px',
        left: (pageWidthAndHeight.width * templateItemFG.get('lowerLeftX').value) / 100 + 'px'
      });
      newItem.children().css({
        width: (pageWidthAndHeight.width * templateItemFG.get('width').value) / 100 + 'px',
        height: (pageWidthAndHeight.height * templateItemFG.get('height').value) / 100 + 'px'
      });
      this.printItemImageInPdf(newItem, templateItemFG);
      newItem.appendTo($('.canvasDropZone-page' + pageNumber));
    }
    this.renderingItems = false;
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
    this.repaintItemsInTemplate();
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
          this.checklistToEdit = this.signDocumentExchange.templateChecklist;
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
          this.refreshItemsAndPdf();
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
}
