import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import TemplatesChecklistsDTO, { TemplateChecklistItemDTO } from '@data/models/templates/templates-checklists-dto';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';

@Injectable({
  providedIn: 'root'
})
export class CreateEditChecklistAuxService {
  private listVariables: WorkflowCardSlotDTO[] = null;

  constructor(private fb: UntypedFormBuilder) {}

  public createChecklistForm(checklistToEdit?: TemplatesChecklistsDTO, variables?: WorkflowCardSlotDTO[]): UntypedFormGroup {
    const checklistItems: UntypedFormGroup[] = [];
    this.listVariables = variables;
    if (checklistToEdit && checklistToEdit.templateChecklistItems?.length) {
      checklistToEdit.templateChecklistItems.forEach((item: TemplateChecklistItemDTO) => {
        checklistItems.push(this.copyItemForPage(item, item.numPage, item.orderNumber, true));
      });
    }
    return this.fb.group({
      id: [checklistToEdit?.id ? checklistToEdit.id : null],
      includeFile: [checklistToEdit?.includeFile ? checklistToEdit.includeFile : false],
      remoteSignature: [checklistToEdit?.remoteSignature ? checklistToEdit.remoteSignature : false],
      //TemplatesCommonDTO;
      template: this.fb.group({
        id: [checklistToEdit?.template?.id ? checklistToEdit.template.id : null],
        name: [checklistToEdit?.template?.name ? checklistToEdit.template.name : null, Validators.required],
        facilities: [checklistToEdit?.template?.facilities ? checklistToEdit.template.facilities : [], Validators.required],
        brands: [checklistToEdit?.template?.brands ? checklistToEdit.template.brands : [], Validators.required],
        departments: [checklistToEdit?.template?.departments ? checklistToEdit.template.departments : []],
        specialties: [checklistToEdit?.template?.specialties ? checklistToEdit.template.specialties : []],
        templateType: ['CHECKLISTS']
      }),
      //TemplateChecklistItemDTO[];
      templateChecklistItems: this.fb.array(checklistItems),
      //AttachmentDTO;
      templateFile: this.fb.group({
        content: [checklistToEdit?.templateFile?.content ? checklistToEdit.templateFile.content : null, Validators.required],
        id: [checklistToEdit?.templateFile?.id ? checklistToEdit.templateFile.id : null],
        name: [checklistToEdit?.templateFile?.name ? checklistToEdit.templateFile.name : null],
        size: [checklistToEdit?.templateFile?.size ? checklistToEdit.templateFile.size : null],
        thumbnail: [checklistToEdit?.templateFile?.thumbnail ? checklistToEdit.templateFile.thumbnail : null],
        type: [checklistToEdit?.templateFile?.type ? checklistToEdit.templateFile.type : 'application/pdf']
      })
    });
  }

  public copyItemForPage(
    item: TemplateChecklistItemDTO,
    pageNumber: number | string,
    newOrderId: number,
    forceId = false
  ): UntypedFormGroup {
    return this.fb.group(
      {
        id: [forceId ? item.id : null],
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
        sincronizedItems: [forceId ? (item.sincronizedItems ? item.sincronizedItems : [newOrderId]) : [newOrderId]],
        itemVal: this.fb.group({
          booleanValue: [item.itemVal?.booleanValue || item.itemVal?.booleanValue === false ? item.itemVal?.booleanValue : null],
          fileValue: this.fb.group({
            content: [item.itemVal?.fileValue?.content ? item.itemVal.fileValue.content : null],
            id: [item.itemVal?.fileValue?.id ? item.itemVal.fileValue.id : null],
            name: [item.itemVal?.fileValue?.name ? item.itemVal.fileValue.name : null],
            size: [item.itemVal?.fileValue?.size ? item.itemVal.fileValue.size : null],
            thumbnail: [item.itemVal?.fileValue?.thumbnail ? item.itemVal.fileValue.thumbnail : null],
            type: [item.itemVal?.fileValue?.type ? item.itemVal.fileValue.type : null]
          }),
          id: [item.itemVal?.id ? item.itemVal.id : null],
          textValue: [item.itemVal?.textValue ? item.itemVal.textValue : null]
        }),
        templateAccountingId: [item.templateAccountingId ? item.templateAccountingId : null],
        templateAccountingItemId: [item.templateAccountingItemId ? item.templateAccountingItemId : null],
        accountingItemAttributeType: [item.accountingItemAttributeType ? item.accountingItemAttributeType : null],
        templateAccountingItemLineId: [item.templateAccountingItemLineId ? item.templateAccountingItemLineId : null],
        accountingItemLineAttributeType: [item.accountingItemLineAttributeType ? item.accountingItemLineAttributeType : null],
        variable: [
          this.listVariables && (item.variable?.id || item.tabItem?.id)
            ? this.listVariables.find((variable: WorkflowCardSlotDTO) => variable.id === (item.variable?.id || item.tabItem?.id))
            : item.variable || item.tabItem
        ]
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

  public newChecklistItemDropped(
    item: JQuery<HTMLElement>,
    offset: {
      top: number;
      left: number;
    },
    pageNumber: number | string,
    uniqueIdOrder: number
  ): UntypedFormGroup {
    const pageWidthAndHeight = this.getPageWidthAndHeight(`${pageNumber}`);
    //Los +20 es porque la tarjeta tiene un margin de 20
    let top = offset.top + 20 - $('.canvasDropZone-page' + pageNumber).offset().top;
    let left = offset.left + 20 - $('.canvasDropZone-page' + pageNumber).offset().left;
    top = top >= 0 ? top : 0;
    left = left >= 0 ? left : 0;
    return this.fb.group(
      {
        id: [null],
        numPage: [parseInt(`${pageNumber}`, 10), Validators.required],
        lowerLeftX: [this.pxToPercentage(pageWidthAndHeight.width, left), Validators.required],
        lowerLeftY: [this.pxToPercentage(pageWidthAndHeight.height, top), Validators.required],
        height: [this.pxToPercentage(pageWidthAndHeight.height, item[0].offsetHeight), Validators.required],
        width: [this.pxToPercentage(pageWidthAndHeight.width, item[0].offsetWidth), Validators.required],
        typeItem: [item.data('type'), Validators.required],
        typeSign: [null],
        staticValue: [false],
        defaultValue: [false],
        orderNumber: [uniqueIdOrder, Validators.required],
        label: [null, Validators.required],
        sincronizedItems: [[uniqueIdOrder]],
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
        templateAccountingId: [null],
        templateAccountingItemId: [null],
        accountingItemAttributeType: [null],
        templateAccountingItemLineId: [null],
        accountingItemLineAttributeType: [null],
        variable: [null],
        tabItem: [null]
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

  public pxToPercentage(cien: number, x: number) {
    // cien => 100%
    // x => return
    return (100 * x) / cien;
  }

  public getPageWidthAndHeight(pageNumber: string): { width: number; height: number } {
    const pageWidthAndHeight = {
      width: 0,
      height: 0
    };
    const arr = document.getElementById('checklistPDF')?.getElementsByClassName('page');
    if (arr) {
      Array.from(arr).forEach((page: Element) => {
        if (pageNumber === `${page.getAttribute('data-page-number')}`) {
          pageWidthAndHeight.width = $(page).width();
          pageWidthAndHeight.height = $(page).height();
        }
      });
    }
    return pageWidthAndHeight;
  }
}
