import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import TemplatesChecklistsDTO, { TemplateChecklistItemDTO } from '@data/models/templates/templates-checklists-dto';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';
@Injectable({
  providedIn: 'root'
})
export class SignDocumentAuxService {
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
        orderNumber: [newOrderId, Validators.required],
        auxOrderNumber: [item.auxOrderNumber, Validators.required],
        label: [item.label, Validators.required],
        sincronizedItems: [
          forceId ? (item.auxSincronizedItems ? item.auxSincronizedItems : [item.auxOrderNumber]) : [item.auxOrderNumber]
        ],
        itemVal: this.fb.group({
          booleanValue: [item.itemVal?.booleanValue ? item.itemVal?.booleanValue : null],
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
        variable: [
          this.listVariables && item.variable?.id
            ? this.listVariables.find((variable: WorkflowCardSlotDTO) => variable.id === item.variable.id)
            : item.variable
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
