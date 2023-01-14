/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import TemplatesChecklistsDTO, {
  AuxChecklistItemsGroupBySyncDTO,
  AuxChecklistItemsGroupByTypeDTO,
  TemplateChecklistItemDTO
} from '@data/models/templates/templates-checklists-dto';
import { TranslateService } from '@ngx-translate/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import $ from 'jquery';
import 'jqueryui';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-create-edit-checklist',
  templateUrl: './create-edit-checklist.component.html',
  styleUrls: ['./create-edit-checklist.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEditChecklistComponent implements OnInit {
  public page: number;
  public checklistForm: UntypedFormGroup;
  public fileTemplateBase64 = new Subject<any>();
  public labels: any = {
    newCheckList: marker('administration.templates.checklists.new'),
    cheklistConfig: marker('administration.templates.checklists.config'),
    itemsInTemplate: marker('administration.templates.checklists.itemsInTemplate'),
    text: marker('administration.templates.checklists.text'),
    sign: marker('administration.templates.checklists.sign'),
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
    showInPage: marker('common.showPage')
  };
  private pdfLoaded = false;
  private checklistToEdit: TemplatesChecklistsDTO = null;
  private uniqueIdOrder = 0;
  public itemListToShow: AuxChecklistItemsGroupByTypeDTO[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  public getTitle(): string {
    if (this.checklistForm?.value?.template?.name) {
      return this.translateService.instant(this.labels.newCheckList) + ': ' + this.checklistForm.value.template.name;
    }
    return this.translateService.instant(this.labels.newCheckList);
  }

  public setItemListToShow(): void {
    const items: TemplateChecklistItemDTO[] = this.checklistForm?.get('templateChecklistItems').value;
    const groupByType: AuxChecklistItemsGroupByTypeDTO[] = [];
    items.forEach((item: TemplateChecklistItemDTO, index) => {
      const group = groupByType.find((g: AuxChecklistItemsGroupByTypeDTO) => g.typeItem === item.typeItem);
      if (group) {
        if (group.numPages.indexOf(item.numPage) === -1) {
          group.numPages.push(item.numPage);
        }
        group.orderNumbers.push(item.orderNumber);
        group.orderNumberPageAssociation[item.orderNumber] = item.numPage;
        group.numPages.sort();
        group.syncGroups.push({
          numPages: [item.numPage],
          bgColor: new FormControl('#050896', [Validators.required]),
          sincronizedItems: [item.orderNumber],
          typeItem: item.typeItem,
          typeSign: item.typeSign,
          variable: item.variable,
          syncronized: false,
          templateChecklistItems: this.fb.array([
            (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).at(index)
          ])
        });
      } else {
        const orderNumberPageAssociation: any = {};
        orderNumberPageAssociation[item.orderNumber] = item.numPage;
        groupByType.push({
          typeItem: item.typeItem,
          typeLabel: this.translateService.instant(this.labels[item.typeItem.toLowerCase()]),
          numPages: [item.numPage],
          orderNumbers: [item.orderNumber],
          orderNumberPageAssociation,
          syncGroups: [
            {
              numPages: [item.numPage],
              bgColor: new FormControl('#050896', [Validators.required]),
              sincronizedItems: [item.orderNumber],
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
    console.log(groupByType);
    this.itemListToShow = groupByType;
  }

  public fileBrowseHandler(item: FileList): void {
    this.getFile(item);
  }

  public fileDropped(item: FileList): void {
    this.getFile(item);
  }

  public changeColorItems(syncGroup: AuxChecklistItemsGroupBySyncDTO): void {
    console.log(syncGroup);
    syncGroup.sincronizedItems.forEach((id) => {
      $(`#item_${id}`)
        .children('.resizable')
        .children('.checklistItemToDrag__label')
        .css({
          backgroundColor: this.colorToRgba(syncGroup.bgColor.value, '0.65'),
          color: this.getFontColor(syncGroup.bgColor.value)
        });
    });
  }

  public eraseTemplatePDF(): void {
    this.checklistForm.get('templateFile').get('id').setValue(null);
    this.checklistForm.get('templateFile').get('thumbnail').setValue(null);
    this.checklistForm.get('templateFile').get('name').setValue(null);
    this.checklistForm.get('templateFile').get('type').setValue(null);
    this.checklistForm.get('templateFile').get('size').setValue(null);
    this.checklistForm.get('templateFile').get('content').setValue(null);
    this.fileTemplateBase64.next(null);
  }

  public pdfZoomChange($event: any) {
    this.configCanvas();
    this.repaintItemsInTemplate();
  }

  public repaintItemsInTemplate(page?: number): void {
    if (this.checklistForm?.value?.templateChecklistItems?.length > 0) {
      setTimeout(() => {
        this.checklistForm.value.templateChecklistItems.forEach((item: TemplateChecklistItemDTO) => {
          if (page && item.numPage === page) {
            this.printItemInPdfPage(item);
          } else if (!page) {
            this.printItemInPdfPage(item);
          }
        });
      });
    }
  }

  public pdfLoadedFn($event: any) {
    console.log('pdf loaded', $event);
    $('.checklistItemToDrag.undropped').draggable({ revert: true, containment: $('.checklist-config') });
    this.pdfLoaded = true;
    // this.configCanvas();
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
      Array.from(document.getElementById('checklistPDF').getElementsByClassName('page')).forEach((page: Element) => {
        const pageNumber = page.getAttribute('data-page-number');
        const loaded = page.getAttribute('data-loaded');
        if (loaded && $('.canvasDropZone-page' + pageNumber).length === 0) {
          const canvas = page.getElementsByClassName('canvasWrapper').item(0); //.getElementsByTagName('canvas').item(0);
          canvas.classList.add('canvasDropZone-page' + pageNumber);
          setTimeout(() => {
            $('.canvasDropZone-page' + pageNumber).droppable({
              drop: (event, ui) => {
                console.log('Drop in canvas --- problema en firefox');
                const item = ui.draggable;
                const offset = ui.offset;
                if (!item.hasClass('dropped')) {
                  this.newItemDropped(item, offset, pageNumber);
                } else {
                  this.pdfItemMoved(item, offset, pageNumber);
                  return true;
                }
              }
            });
            this.repaintItemsInTemplate(parseInt(pageNumber, 10));
          });
        }
      });
    }
  }

  // public save() {
  //   const dataToSave: any = {};
  //   Array.from(document.getElementById('checklistPDF').getElementsByClassName('page')).forEach((page: Element) => {
  //     const pageNumber = page.getAttribute('data-page-number');
  //     const pageW = $(page).width();
  //     const pageH = $(page).height();
  //     dataToSave['page-' + pageNumber] = [];
  //     Array.from(page.getElementsByClassName('dropped')).forEach((dropped: any) => {
  //       let extraData = dropped
  //         .getElementsByClassName('resizable')
  //         .item(0)
  //         .getElementsByTagName('div')
  //         .item(0)
  //         .getAttribute('data-extra');
  //       extraData = extraData ? extraData : {};
  //       dataToSave['page-' + pageNumber].push({
  //         page: {
  //           width: pageW,
  //           height: pageH
  //         },
  //         position: {
  //           topPx: dropped.style.top,
  //           leftPx: dropped.style.left,
  //           top: this.pxToPercentage(pageH, parseInt(dropped.style.top.split('px').join(), 10)),
  //           left: this.pxToPercentage(pageW, parseInt(dropped.style.left.split('px').join(), 10))
  //         },
  //         itemToInsert: {
  //           id: dropped.getElementsByClassName('resizable').item(0).getElementsByTagName('div').item(0).getAttribute('class'),
  //           data: extraData,
  //           widthPx: $(dropped).width(),
  //           heightPx: $(dropped).height(),
  //           width: this.pxToPercentage(pageW, $(dropped).width()),
  //           height: this.pxToPercentage(pageH, $(dropped).height())
  //         }
  //       });
  //     });
  //   });
  //   console.log(dataToSave);
  //   // this.setDrawZone(dataToSave);
  // }

  //Private methods

  private newItemDropped(
    item: JQuery<HTMLElement>,
    offset: {
      top: number;
      left: number;
    },
    pageNumber: number | string
  ): void {
    this.uniqueIdOrder++;
    const pageWidthAndHeight = this.getPageWidthAndHeight(`${pageNumber}`);
    //Los +20 es porque la tarjeta tiene un margin de 20
    let top = offset.top + 20 - $('.canvasDropZone-page' + pageNumber).offset().top;
    let left = offset.left + 20 - $('.canvasDropZone-page' + pageNumber).offset().left;
    top = top >= 0 ? top : 0;
    left = left >= 0 ? left : 0;
    const fbGroug = this.fb.group({
      id: [null],
      numPage: [parseInt(`${pageNumber}`, 10), Validators.required],
      lowerLeftX: [this.pxToPercentage(pageWidthAndHeight.width, left), Validators.required],
      lowerLeftY: [this.pxToPercentage(pageWidthAndHeight.height, top), Validators.required],
      height: [this.pxToPercentage(pageWidthAndHeight.height, item[0].offsetHeight), Validators.required],
      width: [this.pxToPercentage(pageWidthAndHeight.width, item[0].offsetWidth), Validators.required],
      typeItem: [item.data('type'), Validators.required],
      typeSign: [null],
      staticValue: [item.data('type') === 'VARIABLE'],
      orderNumber: [this.uniqueIdOrder, Validators.required],
      frontIdGroup: [null],
      label: [null, Validators.required],
      sincronizedItems: [[]],
      itemVal: this.fb.group({
        booleanValue: [null],
        fileValue: this.fb.group({
          content: [null],
          id: [null],
          name: [null],
          size: [null],
          thumbnail: [null],
          type: [null]
        }),
        id: [null],
        textValue: [null]
      }),
      variable: this.fb.group({
        attributeName: [null],
        entityName: [null],
        id: [null],
        dataType: [null],
        value: [null],
        name: [null],
        contentSource: this.fb.group({
          contentType: this.fb.group({
            id: [null],
            name: [null],
            type: [null]
          }),
          id: [null],
          name: [null]
        })
      })
    });
    (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).push(fbGroug);
    this.printItemInPdfPage(fbGroug.value);
    this.setItemListToShow();
  }

  private pdfItemMoved(
    item: JQuery<HTMLElement>,
    offset: {
      top: number;
      left: number;
    },
    pageNumber: number | string
  ): void {
    const pageWidthAndHeight = this.getPageWidthAndHeight(`${pageNumber}`);
    let top = offset.top - $('.canvasDropZone-page' + pageNumber).offset().top;
    let left = offset.left - $('.canvasDropZone-page' + pageNumber).offset().left;
    top = top >= 0 ? top : 0;
    left = left >= 0 ? left : 0;
    const index = this.checklistForm
      .get('templateChecklistItems')
      .value.findIndex(
        (templateChecklistItem: TemplateChecklistItemDTO) => templateChecklistItem.orderNumber === item.data('id')
      );
    (this.checklistForm.get('templateChecklistItems') as UntypedFormArray)
      .at(index)
      .get('lowerLeftX')
      .setValue(this.pxToPercentage(pageWidthAndHeight.width, left));
    (this.checklistForm.get('templateChecklistItems') as UntypedFormArray)
      .at(index)
      .get('lowerLeftY')
      .setValue(this.pxToPercentage(pageWidthAndHeight.height, top));
  }

  private pdfItemResized(ui: JQueryUI.ResizableUIParams): void {
    const id = ui.originalElement.data('id');
    const index = this.checklistForm
      .get('templateChecklistItems')
      .value.findIndex((templateChecklistItem: TemplateChecklistItemDTO) => templateChecklistItem.orderNumber === id);
    const pageWidthAndHeight = this.getPageWidthAndHeight(
      `${(this.checklistForm.get('templateChecklistItems') as UntypedFormArray).at(index).get('numPage').value}`
    );
    // height: [this.pxToPercentage(pageWidthAndHeight.height, item[0].offsetHeight), Validators.required],
    // width: [this.pxToPercentage(pageWidthAndHeight.width, item[0].offsetWidth), Validators.required],
    (this.checklistForm.get('templateChecklistItems') as UntypedFormArray)
      .at(index)
      .get('width')
      .setValue(this.pxToPercentage(pageWidthAndHeight.width, ui.size.width));
    (this.checklistForm.get('templateChecklistItems') as UntypedFormArray)
      .at(index)
      .get('height')
      .setValue(this.pxToPercentage(pageWidthAndHeight.height, ui.size.height));
  }

  private pxToPercentage(cien: number, x: number) {
    // cien => 100%
    // x => return
    return (100 * x) / cien;
  }

  private getPageWidthAndHeight(pageNumber: string): { width: number; height: number } {
    const pageWidthAndHeight = {
      width: 0,
      height: 0
    };
    Array.from(document.getElementById('checklistPDF').getElementsByClassName('page')).forEach((page: Element) => {
      if (pageNumber === `${page.getAttribute('data-page-number')}`) {
        pageWidthAndHeight.width = $(page).width();
        pageWidthAndHeight.height = $(page).height();
      }
    });
    return pageWidthAndHeight;
  }

  private initForm() {
    const checklistItems: UntypedFormGroup[] = [];
    if (this.checklistToEdit) {
      console.log('Hacer algo aquí', this.checklistToEdit);
      //calcular order number
    }
    this.checklistForm = this.fb.group({
      id: [null],
      includeFile: [false],
      //TemplatesCommonDTO;
      template: this.fb.group({
        id: [null],
        name: [null, Validators.required],
        facilities: [[], Validators.required],
        brands: [[], Validators.required],
        departments: [[]],
        specialties: [[]],
        templateType: ['CHECKLISTS']
      }),
      //TemplateChecklistItemDTO[];
      templateChecklistItems: this.fb.array(checklistItems, [Validators.required]),
      //AttachmentDTO;
      templateFile: this.fb.group({
        content: [null],
        id: [null],
        name: [null],
        size: [null],
        thumbnail: [null],
        type: ['application/pdf']
      })
    });
  }

  private printItemInPdfPage(templateItem: TemplateChecklistItemDTO): void {
    const item = $(`#checklistItemToDrag__${templateItem.typeItem.toLowerCase()}`);
    const pageWidthAndHeight = this.getPageWidthAndHeight(`${templateItem.numPage}`);
    const pageNumber = `${templateItem.numPage}`;
    const uniqueId = templateItem.orderNumber;
    const id = `item_${uniqueId}`;
    const newItem = item.clone();
    newItem.removeClass('undropped');
    newItem.addClass('dropped');
    newItem.attr('id', id);
    newItem.attr('data-id', uniqueId);
    newItem
      .children('.resizable')
      .children('.checklistItemToDrag__label')
      .prepend(`<div class="checklistItemToDrag__orderNumber">${uniqueId}</div> `);
    newItem.children('.resizable').resizable({
      handles: 'ne, se, sw, nw',
      stop: (e, rui) => {
        console.log('STOP RESIZE -- problema en firefox');
        this.pdfItemResized(rui);
      }
    });
    newItem.children('.resizable').attr('data-id', uniqueId);
    newItem.draggable({
      containment: $('.canvasDropZone-page' + pageNumber)
    });
    newItem.css({
      top: (pageWidthAndHeight.height * templateItem.lowerLeftY) / 100 + 'px',
      left: (pageWidthAndHeight.width * templateItem.lowerLeftX) / 100 + 'px'
    });
    newItem.children().css({
      width: (pageWidthAndHeight.width * templateItem.width) / 100 + 'px',
      height: (pageWidthAndHeight.height * templateItem.height) / 100 + 'px'
    });
    newItem.appendTo($('.canvasDropZone-page' + pageNumber));
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
    this.checklistForm.get('templateFile').get('name').setValue(file.name);
    this.checklistForm.get('templateFile').get('type').setValue(file.type);
    this.checklistForm.get('templateFile').get('size').setValue(file.size);
    this.checklistForm.get('templateFile').get('content').setValue(base64.split(';base64,')[1], { emit: true });
    this.checklistForm.markAsDirty();
    this.checklistForm.markAsTouched();
    this.fileTemplateBase64.next(base64.split(';base64,')[1]);
  }

  private colorToRgba(color: string, alpha: string) {
    if (color.charAt(0) === '#') {
      color = color.substring(1, 7);
      const r = parseInt(color.substring(0, 2), 16); // hexToR
      const g = parseInt(color.substring(2, 4), 16); // hexToG
      const b = parseInt(color.substring(4, 6), 16); // hexToB
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
  }

  private getFontColor(baseColor: string): string {
    const lightColor = '#fff';
    const darkColor = '#000';
    if (baseColor) {
      const bgColor = baseColor;
      const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
      const r = parseInt(color.substring(0, 2), 16); // hexToR
      const g = parseInt(color.substring(2, 4), 16); // hexToG
      const b = parseInt(color.substring(4, 6), 16); // hexToB
      return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
    }
    return darkColor;
  }
}
