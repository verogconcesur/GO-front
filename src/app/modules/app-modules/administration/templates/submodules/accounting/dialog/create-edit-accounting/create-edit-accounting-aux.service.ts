import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import {
  AccountingBlockTypeDTO,
  AccountingLineTypeDTO,
  TemplateAccountingItemDTO,
  TemplateAccountingItemLineDTO,
  TemplatesAccountingDTO
} from '@data/models/templates/templates-accounting-dto';
import { TemplateChecklistItemDTO } from '@data/models/templates/templates-checklists-dto';

@Injectable({
  providedIn: 'root'
})
export class CreateEditAccountingAuxService {
  public blockTypes: AccountingBlockTypeDTO[] = [];
  public linesTypes: AccountingLineTypeDTO[] = [];
  constructor(private fb: UntypedFormBuilder) {}

  public createAccountingForm(
    accountingToEdit: TemplatesAccountingDTO,
    blockTypes: AccountingBlockTypeDTO[],
    lineTypes: AccountingLineTypeDTO[]
  ): UntypedFormGroup {
    this.blockTypes = blockTypes;
    this.linesTypes = lineTypes;
    const accountingBlocks: UntypedFormGroup[] = [];
    const templateId = accountingToEdit?.template?.id ? accountingToEdit.template.id : null;
    if (accountingToEdit && accountingToEdit.templateAccountingItems?.length) {
      accountingToEdit.templateAccountingItems.forEach((block: TemplateAccountingItemDTO) => {
        const accountingLines: UntypedFormGroup[] = [];
        block.templateAccountingItemLines.forEach((line: TemplateAccountingItemLineDTO) => {
          accountingLines.push(this.createLineForm(line, templateId));
        });
        accountingBlocks.push(this.creatBlockForm(block, accountingLines));
      });
    }
    return this.fb.group({
      id: [accountingToEdit?.id ? accountingToEdit.id : null],
      //TemplatesCommonDTO;
      template: this.fb.group({
        id: [accountingToEdit?.template?.id ? accountingToEdit.template.id : null],
        name: [accountingToEdit?.template?.name ? accountingToEdit.template.name : null, Validators.required],
        facilities: [accountingToEdit?.template?.facilities ? accountingToEdit.template.facilities : [], Validators.required],
        brands: [accountingToEdit?.template?.brands ? accountingToEdit.template.brands : [], Validators.required],
        departments: [accountingToEdit?.template?.departments ? accountingToEdit.template.departments : []],
        specialties: [accountingToEdit?.template?.specialties ? accountingToEdit.template.specialties : []],
        templateType: ['ACCOUNTING']
      }),
      templateAccountingItems: this.fb.array(accountingBlocks)
    });
  }

  public creatBlockForm(block: TemplateAccountingItemDTO, accountingLines: UntypedFormGroup[]): UntypedFormGroup {
    return this.fb.group({
      id: [block?.id ? block.id : null],
      accountingBlockType: [block?.accountingBlockType ? block.accountingBlockType : null, Validators.required],
      description: [block?.description ? block.description : null, Validators.required],
      descriptionTotal: [block?.descriptionTotal ? block.descriptionTotal : null, Validators.required],
      descriptionTotalPlusTax: [block?.descriptionTotalPlusTax ? block.descriptionTotalPlusTax : null, Validators.required],
      descriptionTotalTax: [block?.descriptionTotalTax ? block.descriptionTotalTax : null, Validators.required],
      orderNumber: [block?.orderNumber ? block.orderNumber : null],
      templateAccountingItemLines: this.fb.array(accountingLines)
    });
  }

  public createLineForm(line: TemplateAccountingItemLineDTO, templateId: number): UntypedFormGroup {
    return this.fb.group({
      id: [line?.id ? line.id : null],
      orderNumber: [line?.orderNumber ? line.orderNumber : null],
      accountingLineType: [line.accountingLineType ? line.accountingLineType : null, Validators.required],
      accumulated: [line?.accumulated ? line.accumulated : false],
      accumulatedLines: [line?.accumulatedLines ? line.accumulatedLines : []],
      description: [line?.description ? line.description : null, Validators.required],
      sign: [line?.sign ? line.sign : null, Validators.required],
      taxApply: [line?.taxApply ? line.taxApply : false],
      templateAccountingItemId: [line?.templateAccountingItemId ? line.templateAccountingItemId : templateId]
    });
  }
}
