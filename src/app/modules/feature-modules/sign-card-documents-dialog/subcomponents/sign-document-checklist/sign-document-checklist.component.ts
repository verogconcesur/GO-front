/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
import { forkJoin, Subject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import { SignDocumentAuxService } from './sign-document-aux.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { ConcenetError } from '@app/types/error';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-sign-document-checklist',
  templateUrl: './sign-document-checklist.component.html',
  styleUrls: ['./sign-document-checklist.component.scss']
})
export class SignDocumentChecklistComponent implements OnInit {
  @Input() wCardId: number;
  @Input() pdf: SignDocumentExchangeDTO;
  @ViewChild('staticImage')
  staticImage: ElementRef;
  public signDocumentExchange: SignDocumentExchangeDTO;
  public page: number;
  public checklistForm: UntypedFormGroup;
  public fileTemplateBase64 = new Subject<any>();
  public pdfNumPages = 0;
  public pages: number[] = [];
  public itemListToShow: AuxChecklistItemsGroupByTypeDTO[] = [];
  public expansionPanelOpened: any = {};
  public pagesSelectedToAddItem: FormControl = new FormControl(null);
  public labels: any = {
    newCheckList: marker('administration.templates.checklists.new'),
    cheklistConfig: marker('administration.templates.checklists.config'),
    itemsInTemplate: marker('administration.templates.checklists.itemsInTemplate'),
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
    staticValue: marker('administration.templates.checklists.staticValue'),
    staticValueInput: marker('administration.templates.checklists.staticValueInput'),
    staticValueImage: marker('administration.templates.checklists.staticValueImage')
  };
  private pdfLoaded = false;
  private checklistToEdit: TemplatesChecklistsDTO = null;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private signDocumentAuxService: SignDocumentAuxService,
    private router: Router,
    private templatesChecklistsService: TemplatesChecklistsService,
    private route: ActivatedRoute,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {
    this.preparePdf();
  }

  public getTitle(): string {
    if (this.checklistForm?.value?.template?.name) {
      return this.translateService.instant(this.labels.newCheckList) + ': ' + this.checklistForm.value.template.name;
    }
    return this.translateService.instant(this.labels.newCheckList);
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
        group.orderNumbers.push(item.orderNumber);
        group.orderNumberPageAssociation[item.orderNumber] = item.numPage;
        group.numPages.sort();
        //Comprobamos si ya está asignado a otro grupo
        const syncGroupFound = group.syncGroups.find(
          (g: AuxChecklistItemsGroupBySyncDTO) => g.sincronizedItems.indexOf(item.orderNumber) >= 0
        );
        if (syncGroupFound) {
          (syncGroupFound.templateChecklistItems as UntypedFormArray).push(
            (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).at(index)
          );
        } else {
          group.syncGroups.push({
            numPages: [item.numPage],
            sincronizedItems: item.sincronizedItems?.length ? item.sincronizedItems : [item.orderNumber],
            selectedItem: item.orderNumber,
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
              sincronizedItems: item.sincronizedItems?.length ? item.sincronizedItems : [item.orderNumber],
              selectedItem: item.orderNumber,
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

  public addStaticImage(item: FileList, itemOrderNumber: number): void {
    this.getImageFile(item, itemOrderNumber);
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
    this.repaintItemsInTemplate();
  }

  public refreshItemsAndPdf(): void {
    this.setItemListToShow();
    this.repaintItemsInTemplate();
  }

  public repaintItemsInTemplate(page?: number): void {
    if (!page) {
      $('.checklistItemToDrag.dropped').remove();
    }
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
      Array.from(document.getElementById('checklistPDF').getElementsByClassName('page')).forEach((page: Element) => {
        const pageNumber = page.getAttribute('data-page-number');
        const loaded = page.getAttribute('data-loaded');
        if (loaded && $('.canvasDropZone-page' + pageNumber).length === 0) {
          const canvas = page.getElementsByClassName('canvasWrapper').item(0); //.getElementsByTagName('canvas').item(0);
          canvas.classList.add('canvasDropZone-page' + pageNumber);
        }
      });
    }
  }

  public getChecklistItemByOrderNumber(ordNumber: number): UntypedFormGroup {
    let fg: UntypedFormGroup = null;
    if (ordNumber && this.checklistForm.get('templateChecklistItems')) {
      (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).controls.forEach((form: UntypedFormGroup) => {
        if (form.get('orderNumber').value === ordNumber) {
          fg = form;
          return fg;
        }
      });
    }
    return fg;
  }

  public getLabelForOrderNumber(ordNumber: number): string {
    let label = this.getChecklistItemByOrderNumber(ordNumber).get('label').value;
    if (label) {
      label = `: ${label}`;
    }
    return label;
  }

  public syncronizationChange(
    opened: boolean,
    groupByType: AuxChecklistItemsGroupByTypeDTO,
    syncGroup: AuxChecklistItemsGroupBySyncDTO
  ): void {
    if (!opened) {
      const itemEdited = syncGroup.selectedItem;
      const syncronizedItems = this.getChecklistItemByOrderNumber(syncGroup.selectedItem).get('sincronizedItems').value;
      groupByType.syncGroups.forEach((sg: AuxChecklistItemsGroupBySyncDTO) => {
        (sg.templateChecklistItems as UntypedFormArray).controls.forEach((fg: UntypedFormGroup) => {
          if (fg.get('orderNumber').value !== itemEdited) {
            const itemOrderNumber = fg.get('orderNumber').value;
            const syncronizedItemsAux = fg.get('sincronizedItems').value;
            if (syncronizedItems.indexOf(itemOrderNumber) >= 0) {
              // Si está sincronizado con el editado debemos igualarlos
              this.getChecklistItemByOrderNumber(itemOrderNumber).get('sincronizedItems').setValue(syncronizedItems);
            } else if (syncronizedItemsAux.filter((element: number) => syncronizedItems.includes(element)).length > 0) {
              // Si el elemento itereado estaba sincronizado con alguno de los items del editado debemos quitarlos
              syncronizedItemsAux
                .filter((element: number) => syncronizedItems.includes(element))
                .forEach((n: number) => {
                  syncronizedItemsAux.splice(syncronizedItemsAux.indexOf(n), 1);
                });
              this.getChecklistItemByOrderNumber(itemOrderNumber).get('sincronizedItems').setValue(syncronizedItemsAux);
            }
          }
        });
      });
      this.setItemListToShow();
    }
  }

  public typeSignChange(syncGroup: AuxChecklistItemsGroupBySyncDTO): void {
    const itemEdited = syncGroup.selectedItem;
    let syncronizedItems: number[] = this.getChecklistItemByOrderNumber(itemEdited).get('sincronizedItems').value;
    if (syncronizedItems.length > 1) {
      syncronizedItems = syncronizedItems.splice(syncronizedItems.indexOf(itemEdited), 1);
      syncronizedItems.forEach((n) => {
        this.getChecklistItemByOrderNumber(n).get('sincronizedItems').setValue(syncronizedItems);
      });
      this.getChecklistItemByOrderNumber(itemEdited).get('sincronizedItems').setValue([itemEdited]);
      this.setItemListToShow();
    }
    this.updateValueAndValidityForm();
  }

  public updateValueAndValidityForm(): void {
    this.checklistForm.get('templateChecklistItems').updateValueAndValidity();
    this.checklistForm.updateValueAndValidity();
  }

  public getSyncronizableItems(
    groupByType: AuxChecklistItemsGroupByTypeDTO,
    syncGroup: AuxChecklistItemsGroupBySyncDTO
  ): number[] {
    if (groupByType.typeItem !== 'SIGN' && groupByType.orderNumbers.length > 1) {
      return groupByType.orderNumbers;
    } else if (
      groupByType.typeItem === 'SIGN' &&
      groupByType.orderNumbers.length > 1 &&
      this.getChecklistItemByOrderNumber(syncGroup.selectedItem).get('typeSign').value
    ) {
      const arr: number[] = [];
      groupByType.orderNumbers.forEach((n: number) => {
        if (
          this.getChecklistItemByOrderNumber(n).get('typeSign').value ===
          this.getChecklistItemByOrderNumber(syncGroup.selectedItem).get('typeSign').value
        ) {
          arr.push(n);
        }
      });
      return arr;
    }
    return [];
  }

  public getSyncGroupLabel(syncGroup: AuxChecklistItemsGroupBySyncDTO): string {
    let str = '';
    const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(syncGroup.selectedItem);
    if (fg.get('typeItem').value === 'SIGN' && fg.get('typeSign').value) {
      str = this.translateService.instant(this.labels[fg.get('typeSign').value]);
    }
    if (fg.get('label').value) {
      str += str
        ? `: ${this.getChecklistItemByOrderNumber(syncGroup.selectedItem).get('label').value}`
        : this.getChecklistItemByOrderNumber(syncGroup.selectedItem).get('label').value;
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
            itemsWithErrors.push(fg.get('orderNumber').value);
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
            item.sincronizedItems = item.sincronizedItems.length === 1 || item.staticValue ? null : item.sincronizedItems;
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

  //Private methods

  private initForm() {
    this.checklistForm = this.signDocumentAuxService.createChecklistForm(this.checklistToEdit, []);
    this.updateValueAndValidityForm();
  }

  private printItemInPdfPage(templateItemFG: UntypedFormGroup): void {
    const item = $(`#checklistItemToDrag__${templateItemFG.get('typeItem').value.toLowerCase()}`);
    const pageWidthAndHeight = this.signDocumentAuxService.getPageWidthAndHeight(`${templateItemFG.get('numPage').value}`);
    const pageNumber = `${templateItemFG.get('numPage').value}`;
    const uniqueId = templateItemFG.get('orderNumber').value;
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
    newItem.children('.resizable').attr('data-id', uniqueId);
    newItem.css({
      top: (pageWidthAndHeight.height * templateItemFG.get('lowerLeftY').value) / 100 + 'px',
      left: (pageWidthAndHeight.width * templateItemFG.get('lowerLeftX').value) / 100 + 'px'
    });
    newItem.children().css({
      width: (pageWidthAndHeight.width * templateItemFG.get('width').value) / 100 + 'px',
      height: (pageWidthAndHeight.height * templateItemFG.get('height').value) / 100 + 'px'
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
    fg.get('itemVal').get('fileValue').get('name').setValue(file.name);
    fg.get('itemVal').get('fileValue').get('type').setValue(file.type);
    fg.get('itemVal').get('fileValue').get('size').setValue(file.size);
    fg.get('itemVal').get('fileValue').get('content').setValue(base64.split(';base64,')[1], { emit: true });
    this.checklistForm.markAsDirty();
    this.checklistForm.markAsTouched();
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
          this.fileTemplateBase64.next(data.procesedFile.content);
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
