/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModulesConstants } from '@app/constants/modules.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TemplatesAccountingDTO } from '@data/models/templates/templates-accounting-dto';
import TemplatesChecklistsDTO, {
  AuxChecklistItemsGroupBySyncDTO,
  AuxChecklistItemsGroupByTypeDTO,
  TemplateChecklistItemDTO
} from '@data/models/templates/templates-checklists-dto';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import { CardService } from '@data/services/cards.service';
import { TemplatesAccountingsService } from '@data/services/templates-accountings.service';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { VariablesService } from '@data/services/variables.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import $ from 'jquery';
import 'jqueryui';
import { forkJoin, Subject } from 'rxjs';
import { finalize, map, switchMap, take } from 'rxjs/operators';
import { CreateEditChecklistAuxService } from './create-edit-checklist-aux.service';

@Component({
  selector: 'app-create-edit-checklist',
  templateUrl: './create-edit-checklist.component.html',
  styleUrls: ['./create-edit-checklist.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEditChecklistComponent implements OnInit {
  @ViewChild('fileDropRef')
  fileDropRef: ElementRef;
  @ViewChild('staticImage')
  staticImage: ElementRef;
  public page: number;
  public checklistForm: UntypedFormGroup;
  public fileTemplateBase64 = new Subject<any>();
  public pdfNumPages = 0;
  public pages: number[] = [];
  public itemListToShow: AuxChecklistItemsGroupByTypeDTO[] = [];
  public expansionPanelOpened: any = {};
  public listVariables: WorkflowCardSlotDTO[] = [];
  public customListVariables: WorkflowCardSlotDTO[] = [];
  public allList: WorkflowCardSlotDTO[] = [];
  public pagesSelectedToAddItem: FormControl = new FormControl(null);
  public listTemplates: TemplatesAccountingDTO[];
  public templateAccountingItem: TemplatesAccountingDTO;
  public blockAttributes = [
    { id: 'NAME', name: this.translateService.instant(marker('administration.templates.checklists.nameBlock')) },
    { id: 'TYPE', name: this.translateService.instant(marker('administration.templates.checklists.typeBlock')) },
    { id: 'LINE', name: this.translateService.instant(marker('administration.templates.checklists.lineBlock')) },
    { id: 'TYPE_TAX', name: this.translateService.instant(marker('administration.templates.checklists.typeIvaBlock')) },
    { id: 'TOTAL', name: this.translateService.instant(marker('administration.templates.checklists.totalBlock')) },
    { id: 'TOTAL_TAX', name: this.translateService.instant(marker('administration.templates.checklists.totalIvaBlock')) },
    { id: 'TOTAL_PLUS_TAX', name: this.translateService.instant(marker('administration.templates.checklists.totalplusIvaBlock')) }
  ];
  public lineAttributes = [
    { id: 'NAME', name: this.translateService.instant(marker('administration.templates.checklists.nameLine')) },
    { id: 'TYPE', name: this.translateService.instant(marker('administration.templates.checklists.typeLine')) },
    { id: 'TYPE_TAX', name: this.translateService.instant(marker('administration.templates.checklists.typeIvaLine')) },
    { id: 'AMOUNT', name: this.translateService.instant(marker('administration.templates.checklists.amountLine')) }
  ];
  public allBlocksMap: Map<string, any[]> = new Map();
  selectedType: string | null = null;
  showTypeSelect = false;
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
    accounting: marker('administration.templates.checklists.accounting'),
    image: marker('administration.templates.checklists.image'),
    name: marker('administration.templates.checklists.name'),
    nameRequired: marker('userProfile.nameRequired'),
    templates: marker('administration.templates.checklists.templates'),
    selectBlock: marker('administration.templates.checklists.selectBlock'),
    attrBlock: marker('administration.templates.checklists.attrBlock'),
    selectLine: marker('administration.templates.checklists.selectLine'),
    attrLine: marker('administration.templates.checklists.attrLine'),
    includeFile: marker('administration.templates.checklists.includeFile'),
    remoteSignature: marker('administration.templates.checklists.remoteSignature'),
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
    defaultValue: marker('administration.templates.checklists.defaultValue'),
    staticValue: marker('administration.templates.checklists.staticValue'),
    staticValueInput: marker('administration.templates.checklists.staticValueInput'),
    staticValueImage: marker('administration.templates.checklists.staticValueImage')
  };
  private pdfLoaded = false;
  private checklistToEdit: TemplatesChecklistsDTO = null;
  private uniqueIdOrder = 0;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private variablesService: VariablesService,
    private createEditChecklistAuxService: CreateEditChecklistAuxService,
    private router: Router,
    private templatesChecklistsService: TemplatesChecklistsService,
    private route: ActivatedRoute,
    private cardService: CardService,
    private templateAccountingService: TemplatesAccountingsService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    const variablesRequest = this.variablesService.searchVariablesTemplateSlots();
    const customVariableRequest = this.variablesService.searchCustomVariablesSlots();
    if (this.isContractedModule('accounting')) {
      this.getAccountingTemplates();
    }
    if (this.route?.snapshot?.params?.id) {
      const spinner = this.spinnerService.show();
      forkJoin([
        variablesRequest,
        this.templatesChecklistsService.findChecklistById(this.route.snapshot.params.id),
        customVariableRequest
      ])
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe(
          (responses: [WorkflowCardSlotDTO[], TemplatesChecklistsDTO, WorkflowCardSlotDTO[]]) => {
            this.listVariables = [...responses[0], ...responses[2]].sort((a, b) => {
              return a.name.localeCompare(b.name);
            });
            if (this.isContractedModule('budget')) {
              this.checklistToEdit = responses[1];
            } else {
              this.checklistToEdit = {
                ...responses[1],
                templateChecklistItems: responses[1].templateChecklistItems.filter((item) => item.typeItem !== 'ACCOUNTING')
              };
            }
            // Cálculo de uniqueIdOrder
            this.uniqueIdOrder = this.checklistToEdit.templateChecklistItems?.reduce(
              (prev: number, curr: TemplateChecklistItemDTO) => {
                if (curr.orderNumber > prev) {
                  prev = curr.orderNumber;
                }
                return prev;
              },
              0
            );

            // Inicializamos el formulario y refrescamos
            this.initForm();
            this.fileTemplateBase64.next(this.checklistForm.get('templateFile').get('content').value);
            this.refreshItemsAndPdf();
          },
          (errors) => {
            // Manejo de errores
            this.globalMessageService.showError({
              message: this.translateService.instant(errors[1]?.message),
              actionText: this.translateService.instant(marker('common.close'))
            });
            this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.CHECKLISTS]);
          }
        );
    } else {
      forkJoin([variablesRequest, customVariableRequest])
        .pipe(take(1))
        .subscribe(([variablesRes, customVariablesRes]) => {
          this.listVariables = [...variablesRes, ...customVariablesRes];
          this.listVariables = [...variablesRes, ...customVariablesRes].sort((a, b) => {
            return a.name.localeCompare(b.name);
          });
          this.initForm();
        });
    }
  }

  public isRemoteSign(): boolean {
    return this.checklistForm?.get('remoteSignature')?.value ? true : false;
  }

  public getTitle(): string {
    if (this.checklistToEdit) {
      return this.checklistForm.value.template.name;
    }
    if (this.checklistForm?.value?.template?.name) {
      return this.translateService.instant(this.labels.newCheckList) + ': ' + this.checklistForm.value.template.name;
    }
    return this.translateService.instant(this.labels.newCheckList);
  }
  public isContractedModule(option: string): boolean {
    const configList = this.authenticationService.getConfigList();
    if (option === 'accounting') {
      return configList.includes(ModulesConstants.ACCOUNTING);
    } else if (option === 'customerArea') {
      return configList.includes(ModulesConstants.TIME_LINE);
    }
  }
  public getAccountingTemplates() {
    this.templateAccountingService
      .findAccountingTemplates()
      .pipe(
        take(1),
        switchMap((templates) => {
          this.listTemplates = templates;
          const accountingItemsRequests = templates.map((template) =>
            this.templateAccountingService.findById(template.template.id).pipe(
              map((resp) => {
                return {
                  templateId: template.id,
                  allBlocks: resp.templateAccountingItems || []
                };
              })
            )
          );
          return forkJoin(accountingItemsRequests);
        })
      )
      .subscribe((allBlocksList) => {
        this.allBlocksMap = new Map<string, any[]>();
        allBlocksList.forEach((item) => {
          this.allBlocksMap.set(item.templateId.toString(), item.allBlocks);
        });
      });
  }
  public setItemListToShow(): void {
    let items: TemplateChecklistItemDTO[] = this.checklistForm?.get('templateChecklistItems').getRawValue();
    if (this.isRemoteSign()) {
      items = items.filter((item: TemplateChecklistItemDTO) => {
        return item.typeItem !== 'DRAWING';
      });
    }
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
            templateAccountingId: item.templateAccountingId,
            templateAccountingItemId: item.templateAccountingItemId,
            accountingItemAttributeType: item.accountingItemAttributeType,
            templateAccountingItemLineId: item.templateAccountingItemLineId,
            accountingItemLineAttributeType: item.accountingItemLineAttributeType,
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
              templateAccountingId: item.templateAccountingId,
              templateAccountingItemId: item.templateAccountingItemId,
              accountingItemAttributeType: item.accountingItemAttributeType,
              templateAccountingItemLineId: item.templateAccountingItemLineId,
              accountingItemLineAttributeType: item.accountingItemLineAttributeType,
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

  public fileBrowseHandler(item: FileList): void {
    this.getFile(item);
  }

  public fileDropped(item: FileList): void {
    this.getFile(item);
  }

  public addStaticImage(item: FileList, itemOrderNumber: number): void {
    this.getImageFile(item, itemOrderNumber);
    this.refreshItemValWithSyncItems(itemOrderNumber);
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

  public staticOrDefaultValueChange(field: 'staticValue' | 'defaultValue', itemOrderNumber: number): void {
    const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(itemOrderNumber);
    const field2 = field === 'staticValue' ? 'defaultValue' : 'staticValue';
    if (fg?.get(field)?.value && fg?.get(field2).value) {
      fg.get(field2).setValue(false);
      this.updateValueAndValidityForm();
    }
  }

  public refreshItemValWithSyncItems(itemOrderNumber: number): void {
    const fg: UntypedFormGroup = this.getChecklistItemByOrderNumber(itemOrderNumber);
    const value: TemplateChecklistItemDTO = fg.getRawValue();
    const sincronizedItems = (value?.sincronizedItems?.length > 1 ? value.sincronizedItems : [value.orderNumber]).filter(
      (orderNumber) => orderNumber !== value.orderNumber
    );
    sincronizedItems.forEach((sincItem) => {
      const fg2: UntypedFormGroup = this.getChecklistItemByOrderNumber(sincItem);
      if (fg2) {
        if (fg2.get('defaultValue').value !== value.defaultValue) {
          fg2.get('defaultValue').setValue(value.defaultValue);
        }
        if (fg2.get('itemVal')?.get('textValue').value !== value.itemVal?.textValue) {
          fg2.get('itemVal').get('textValue').setValue(value.itemVal.textValue);
        }
        if (fg2.get('itemVal')?.get('booleanValue').value !== value.itemVal?.booleanValue) {
          fg2.get('itemVal').get('booleanValue').setValue(value.itemVal.booleanValue);
        }
      }
    });
    this.updateValueAndValidityForm();
  }

  public eraseTemplatePDF(): void {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.checklists.deleteFileConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.fileDropRef.nativeElement.value = '';
          this.checklistForm.get('templateFile').get('id').setValue(null);
          this.checklistForm.get('templateFile').get('thumbnail').setValue(null);
          this.checklistForm.get('templateFile').get('name').setValue(null);
          this.checklistForm.get('templateFile').get('type').setValue(null);
          this.checklistForm.get('templateFile').get('size').setValue(null);
          this.checklistForm.get('templateFile').get('content').setValue(null);
          while ((this.checklistForm.get('templateChecklistItems') as UntypedFormArray).length !== 0) {
            (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).removeAt(0);
          }
          this.pdfNumPages = 0;
          this.pages = [];
          this.fileTemplateBase64.next(null);
          this.refreshItemsAndPdf();
          this.updateValueAndValidityForm();
        }
      });
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
    }
  }

  public pdfLoadedFn($event: any) {
    this.pdfNumPages = $event.pagesCount;
    this.pages = [...Array(this.pdfNumPages).keys()].map((x) => ++x);
    $('.checklistItemToDrag.undropped').draggable({ revert: true, containment: $('.checklist-config') });
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
      const arr = document.getElementById('checklistPDF')?.getElementsByClassName('page');
      if (arr) {
        Array.from(arr).forEach((page: Element) => {
          const pageNumber = page.getAttribute('data-page-number');
          const loaded = page.getAttribute('data-loaded');
          if (loaded && $('.canvasDropZone-page' + pageNumber).length === 0) {
            const canvas = page.getElementsByClassName('canvasWrapper').item(0); //.getElementsByTagName('canvas').item(0);
            canvas.classList.add('canvasDropZone-page' + pageNumber);
            setTimeout(() => {
              $('.canvasDropZone-page' + pageNumber).droppable({
                drop: (event, ui) => {
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

  public deleteChecklistItem(ordNumber: number): void {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).removeAt(
            (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).value.findIndex(
              (f: TemplateChecklistItemDTO) => f.orderNumber === ordNumber
            )
          );
          this.uniqueIdOrder--;
          (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).controls.forEach(
            (f: UntypedFormGroup, index: number) => {
              f.get('orderNumber').setValue(index + 1);
              let syncronizedItems: number[] = f.get('sincronizedItems').value;
              syncronizedItems = syncronizedItems
                .map((n) => {
                  if (n === ordNumber) {
                    return null;
                  } else if (n > ordNumber) {
                    return n - 1;
                  }
                  return n;
                })
                .filter((n) => n && n > 0);
              f.get('sincronizedItems').setValue(syncronizedItems);
            }
          );
          this.refreshItemsAndPdf();
        }
      });
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
      this.refreshItemValWithSyncItems(syncGroup.selectedItem);
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

  public duplicateItemIn(opened: boolean, syncGroup: AuxChecklistItemsGroupBySyncDTO): void {
    if (!opened) {
      const fg = this.getChecklistItemByOrderNumber(syncGroup.selectedItem);
      this.pagesSelectedToAddItem.value?.forEach((n: number) => {
        this.uniqueIdOrder++;
        const value: TemplateChecklistItemDTO = fg.getRawValue();
        if (value.itemVal) {
          value.itemVal.id = null;
        }
        const result = this.createEditChecklistAuxService.copyItemForPage(value, n, this.uniqueIdOrder);
        (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).push(result);
      });
      this.pagesSelectedToAddItem.setValue([]);
      this.refreshItemsAndPdf();
    }
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

  public getLines(syncGroup: AuxChecklistItemsGroupBySyncDTO): any[] {
    const templateChecklistItems = this.checklistForm.get('templateChecklistItems').value;
    const selectedBlock = templateChecklistItems[syncGroup.selectedItem - 1];
    const templateId = selectedBlock.templateAccountingId;
    const blocks = this.allBlocksMap.get(templateId.toString());
    if (blocks) {
      const block = blocks.find((b) => b.id === selectedBlock.templateAccountingItemId);
      if (block && block.templateAccountingItemLines) {
        return block.templateAccountingItemLines;
      }
    }
    return [];
  }

  public getAllBlocks(syncGroup: AuxChecklistItemsGroupBySyncDTO): any[] {
    const index = syncGroup.selectedItem - 1;
    const templateChecklistItems = this.checklistForm.get('templateChecklistItems') as UntypedFormArray;
    const templateId = templateChecklistItems.at(index).value.templateAccountingId;
    return this.allBlocksMap.get(templateId?.toString()) || [];
  }

  public isTemplateSelected(syncGroup: any): boolean {
    const index = syncGroup.selectedItem - 1;
    const templateChecklistItems = this.checklistForm.get('templateChecklistItems') as UntypedFormArray;
    const templateId = templateChecklistItems.at(index)?.value.templateAccountingId;
    return !!templateId;
  }

  public isBlockSelected(syncGroup: any): boolean {
    const index = syncGroup.selectedItem - 1;
    const templateChecklistItems = this.checklistForm.get('templateChecklistItems') as UntypedFormArray;
    const blockId = templateChecklistItems.at(index)?.value.templateAccountingItemId;
    return !!blockId;
  }

  public isLineSelected(syncGroup: any): boolean {
    const index = syncGroup.selectedItem - 1;
    const templateChecklistItems = this.checklistForm.get('templateChecklistItems') as UntypedFormArray;
    const accountingItemAttributeType = templateChecklistItems.at(index)?.value.accountingItemAttributeType;
    return accountingItemAttributeType === 'LINE';
  }

  public isLineAttibuteSelected(syncGroup: any): boolean {
    const index = syncGroup.selectedItem - 1;
    const templateChecklistItems = this.checklistForm.get('templateChecklistItems') as UntypedFormArray;
    const templateAccountingItemLineId = templateChecklistItems.at(index)?.value.templateAccountingItemLineId;
    return !!templateAccountingItemLineId;
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
          const data: TemplatesChecklistsDTO = this.checklistForm.getRawValue();
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
          if (data.remoteSignature) {
            data.templateChecklistItems = data.templateChecklistItems.filter((item: TemplateChecklistItemDTO) => {
              return item.typeItem !== 'DRAWING';
            });
          }
          data.templateChecklistItems.map((item: any) => {
            item.sincronizedItems = item.sincronizedItems.length === 1 || item.staticValue ? null : item.sincronizedItems;
            if (item.typeItem === 'IMAGE' && this.isRemoteSign()) {
              item.staticValue = true;
            }

            if (item.typeItem === 'VARIABLE') {
              if (item.variable.tabId) {
                item.tabItem = { id: item.variable.id };
                delete item.variable;
              } else {
                item.variable = { id: item.variable.id };
              }
            }
            if (
              (item.staticValue || item.defaultValue) &&
              item.typeItem !== 'SIGN' &&
              item.typeItem !== 'DRAWING' &&
              item.typeItem !== 'IMAGE'
            ) {
              item.itemVal.fileValue = null;
            } else if (!(item.staticValue || item.defaultValue)) {
              item.itemVal = null;
            }
            if (item.defaultValue && item.typeItem === 'CHECK' && !item.itemVal.booleanValue) {
              item.itemVal.booleanValue = false;
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

  public compareVariables = (a: any, b: any): boolean => {
    if (!a || !b) {
      return a === b;
    }

    // Comparar por ID, entityName y contentSource para distinguir entre tipos
    return (
      a.id === b.id &&
      a.entityName === b.entityName &&
      a.attributeName === b.attributeName &&
      a.name === b.name &&
      !!a.contentSource === !!b.contentSource
    );
  };

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
    const fbGroug = this.createEditChecklistAuxService.newChecklistItemDropped(item, offset, pageNumber, this.uniqueIdOrder);
    (this.checklistForm.get('templateChecklistItems') as UntypedFormArray).push(fbGroug);
    this.printItemInPdfPage(fbGroug);
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
    const pageWidthAndHeight = this.createEditChecklistAuxService.getPageWidthAndHeight(`${pageNumber}`);
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
      .setValue(this.createEditChecklistAuxService.pxToPercentage(pageWidthAndHeight.width, left), { emit: true });
    (this.checklistForm.get('templateChecklistItems') as UntypedFormArray)
      .at(index)
      .get('lowerLeftY')
      .setValue(this.createEditChecklistAuxService.pxToPercentage(pageWidthAndHeight.height, top), { emit: true });
  }

  private pdfItemResized(ui: JQueryUI.ResizableUIParams): void {
    const id = ui.originalElement.data('id');
    const index = this.checklistForm
      .get('templateChecklistItems')
      .value.findIndex((templateChecklistItem: TemplateChecklistItemDTO) => templateChecklistItem.orderNumber === id);
    const pageWidthAndHeight = this.createEditChecklistAuxService.getPageWidthAndHeight(
      `${(this.checklistForm.get('templateChecklistItems') as UntypedFormArray).at(index).get('numPage').value}`
    );
    (this.checklistForm.get('templateChecklistItems') as UntypedFormArray)
      .at(index)
      .get('width')
      .setValue(this.createEditChecklistAuxService.pxToPercentage(pageWidthAndHeight.width, ui.size.width), { emit: true });
    (this.checklistForm.get('templateChecklistItems') as UntypedFormArray)
      .at(index)
      .get('height')
      .setValue(this.createEditChecklistAuxService.pxToPercentage(pageWidthAndHeight.height, ui.size.height), { emit: true });
  }

  private initForm() {
    this.checklistForm = this.createEditChecklistAuxService.createChecklistForm(this.checklistToEdit, this.listVariables);
    this.updateValueAndValidityForm();
  }

  private printItemInPdfPage(templateItemFG: UntypedFormGroup): void {
    const item = $(`#checklistItemToDrag__${templateItemFG.get('typeItem').value.toLowerCase()}`);
    const pageWidthAndHeight = this.createEditChecklistAuxService.getPageWidthAndHeight(`${templateItemFG.get('numPage').value}`);
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
    newItem.children('.resizable').resizable({
      handles: 'ne, se, sw, nw',
      stop: (e, rui) => {
        this.pdfItemResized(rui);
      }
    });
    newItem.children('.resizable').attr('data-id', uniqueId);
    newItem.draggable({
      containment: $('.canvasDropZone-page' + pageNumber)
    });
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
    this.staticImage.nativeElement.value = '';
  }
}
