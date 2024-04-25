/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import {
  AccountingLineSign,
  AccountingLineSignsConst,
  AccountingBlockTypeDTO,
  TemplateAccountingItemDTO,
  TemplateAccountingItemLineDTO
} from '@data/models/templates/templates-accounting-dto';
import { TemplatesAccountingsService } from '@data/services/templates-accountings.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, catchError, finalize, map, of, startWith, take } from 'rxjs';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';

export const enum CreateEditBlockComponentModalEnum {
  ID = 'create-edit-block-dialog-id',
  PANEL_CLASS = 'create-edit-block-dialog',
  TITLE = 'administration.templates.accounting.newBlock'
}

@Component({
  selector: 'app-create-edit-block',
  templateUrl: './create-edit-block.component.html',
  styleUrls: ['./create-edit-block.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEditBlockComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public blockForm: UntypedFormGroup;
  public blockToEdit: TemplateAccountingItemDTO = null;
  public blockTypes: AccountingBlockTypeDTO[] = [];
  public blockTypesControl = new FormControl<string | AccountingBlockTypeDTO>('', Validators.required);
  public blockTypesFilteredOptions: Observable<AccountingBlockTypeDTO[]>;
  public lastBlockTypeWritten: string;
  public templateId: number;
  public labels: any = {
    description: marker('administration.templates.accounting.description'),
    required: marker('errors.required'),
    descriptionTotal: marker('administration.templates.accounting.descriptionTotal'),
    descriptionTotalPlusTax: marker('administration.templates.accounting.descriptionTotalPlusTax'),
    descriptionTotalTax: marker('administration.templates.accounting.descriptionTotalTax'),
    accountingBlockType: marker('administration.templates.accounting.blockType')
  };

  constructor(
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private templateAccountingsService: TemplatesAccountingsService
  ) {
    super(
      CreateEditBlockComponentModalEnum.ID,
      CreateEditBlockComponentModalEnum.PANEL_CLASS,
      CreateEditBlockComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.blockForm = this.extendedComponentData.form;
    this.blockTypes = this.extendedComponentData.types;
    this.templateId = this.extendedComponentData.templateId;
    const formValue = this.blockForm.value;
    this.blockToEdit = formValue.id ? formValue : null;
    if (this.blockToEdit) {
      this.MODAL_TITLE = this.translateService.instant(this.labels.editLine);
    }
    if (this.blockToEdit?.accountingBlockType) {
      this.selectBlockType(this.blockToEdit.accountingBlockType);
    }
    this.blockTypesFilteredOptions = this.blockTypesControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const desc = typeof value === 'string' ? value : value?.description;
        return desc ? this.filter(desc as string) : this.blockTypes.slice();
      })
    );
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.blockForm.touched && this.blockForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | UntypedFormGroup> {
    return of(this.blockForm);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.cancel'),
          design: 'flat'
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.blockForm && this.blockForm.touched && this.blockForm.dirty && this.blockForm.valid)
        }
      ]
    };
  }

  public selectBlockType(type: AccountingBlockTypeDTO): void {
    if (type.id === -999) {
      type = { id: null, description: this.lastBlockTypeWritten };
      this.blockTypes.push(type);
    }
    this.blockForm.get('accountingBlockType').setValue(type);
    this.updateValueAndValidityForm();
    setTimeout(() => {
      this.blockTypesControl.setValue(type);
    }, 100);
  }

  public updateValueAndValidityForm(): void {
    this.blockForm.updateValueAndValidity();
  }

  public displayFn(type: AccountingBlockTypeDTO): string {
    return type && type.description ? type.description : '';
  }

  public compareLines(object1: TemplateAccountingItemLineDTO, object2: TemplateAccountingItemLineDTO) {
    return object1 && object2 && object1.id === object2.id;
  }

  private filter(desc: string): AccountingBlockTypeDTO[] {
    if (this.blockForm.get('accountingBlockType').value?.description !== desc) {
      this.blockForm.get('accountingBlockType').setValue(null);
    }
    if (desc !== this.translateService.instant(marker('administration.templates.accounting.addAsNewLineType'))) {
      this.lastBlockTypeWritten = desc;
    } else {
      desc = this.lastBlockTypeWritten;
    }
    const filterValue = desc.toLowerCase();
    const options = this.blockTypes.filter((option) => option.description.toLowerCase().includes(filterValue));
    if (options.length) {
      return options;
    } else {
      return [
        { id: -999, description: this.translateService.instant(marker('administration.templates.accounting.addAsNewLineType')) }
      ];
    }
  }
}
