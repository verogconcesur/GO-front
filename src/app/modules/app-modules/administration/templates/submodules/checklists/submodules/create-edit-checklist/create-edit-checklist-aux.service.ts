import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TemplateAtachmentItemsDTO } from '@data/models/templates/templates-attachment-dto';
import TemplatesChecklistsDTO, { TemplateChecklistItemDTO } from '@data/models/templates/templates-checklists-dto';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CreateEditChecklistAuxService {
  constructor(private fb: UntypedFormBuilder) {}

  public createChecklistForm(checklistToEdit?: TemplatesChecklistsDTO): UntypedFormGroup {
    const checklistItems: UntypedFormGroup[] = [];
    if (checklistToEdit) {
      console.log('Hacer algo aquí', checklistToEdit);
      //calcular order number
    }
    return this.fb.group({
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
      templateChecklistItems: this.fb.array(checklistItems),
      //AttachmentDTO;
      templateFile: this.fb.group({
        content: [null, Validators.required],
        id: [null],
        name: [null],
        size: [null],
        thumbnail: [null],
        type: ['application/pdf']
      })
    });
  }

  public copyItemForPage(item: TemplateChecklistItemDTO, pageNumber: number | string, newOrderId: number): UntypedFormGroup {
    return this.fb.group(
      {
        id: [null],
        numPage: [parseInt(`${pageNumber}`, 10), Validators.required],
        lowerLeftX: [item.lowerLeftX, Validators.required],
        lowerLeftY: [item.lowerLeftY, Validators.required],
        height: [item.height, Validators.required],
        width: [item.width, Validators.required],
        typeItem: [item.typeItem, Validators.required],
        typeSign: [item.typeSign],
        staticValue: [item.staticValue],
        orderNumber: [newOrderId, Validators.required],
        label: [item.label, Validators.required],
        sincronizedItems: [[newOrderId]],
        itemVal: this.fb.group({
          booleanValue: [item.itemVal.booleanValue],
          fileValue: this.fb.group({
            content: [item.itemVal.fileValue.content],
            id: [item.itemVal.fileValue.id],
            name: [item.itemVal.fileValue.name],
            size: [item.itemVal.fileValue.size],
            thumbnail: [item.itemVal.fileValue.thumbnail],
            type: [item.itemVal.fileValue.type]
          }),
          id: [item.itemVal.id],
          textValue: [item.itemVal.textValue]
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
        staticValue: [item.data('type') === 'VARIABLE'],
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
        variable: [null]
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
    Array.from(document.getElementById('checklistPDF').getElementsByClassName('page')).forEach((page: Element) => {
      if (pageNumber === `${page.getAttribute('data-page-number')}`) {
        pageWidthAndHeight.width = $(page).width();
        pageWidthAndHeight.height = $(page).height();
      }
    });
    return pageWidthAndHeight;
  }
}
