/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import {
  AccountingLineSign,
  AccountingLineSignsConst,
  AccountingLineTypeDTO,
  TemplateAccountingItemLineDTO
} from '@data/models/templates/templates-accounting-dto';
import { TemplatesAccountingsService } from '@data/services/templates-accountings.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, catchError, finalize, map, of, startWith, take } from 'rxjs';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';

export const enum CardAccountingLineFormComponentModalEnum {
  ID = 'card-accounting-line-form-dialog-id',
  PANEL_CLASS = 'card-accounting-line-form-dialog',
  TITLE = 'administration.templates.accounting.newLine'
}

@Component({
  selector: 'app-card-accounting-line-dialog-form',
  templateUrl: './card-accounting-line-dialog-form.component.html',
  styleUrls: ['./card-accounting-line-dialog-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardAccountingLineDialogFormComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public lineForm: UntypedFormGroup;
  public lineToEdit: TemplateAccountingItemLineDTO = null;
  public linesTypes: AccountingLineTypeDTO[] = [];
  public linesTypesControl = new FormControl<string | AccountingLineTypeDTO>('', Validators.required);
  public linesTypesFilteredOptions: Observable<AccountingLineTypeDTO[]>;
  public lastLineTypeWritten: string;
  public lineSigns: AccountingLineSign[] = AccountingLineSignsConst;
  public comboSimpleAccumulatedLines: TemplateAccountingItemLineDTO[] = [];
  public templateId: number;
  public labels: any = {
    description: marker('administration.templates.accounting.description'),
    required: marker('errors.required'),
    line: marker('administration.templates.accounting.line'),
    newLine: marker('administration.templates.accounting.newLine'),
    editLine: marker('administration.templates.accounting.editLine'),
    accountingLineType: marker('administration.templates.accounting.lineType'),
    accumulated: marker('administration.templates.accounting.lineAccumulated'),
    groupLines: marker('administration.templates.accounting.groupLines'),
    accumulatedLines: marker('administration.templates.accounting.accumulatedLines'),
    sign: marker('administration.templates.accounting.lineSign'),
    taxApply: marker('administration.templates.accounting.lineTaxApply')
  };

  constructor(
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private templateAccountingsService: TemplatesAccountingsService
  ) {
    super(
      CardAccountingLineFormComponentModalEnum.ID,
      CardAccountingLineFormComponentModalEnum.PANEL_CLASS,
      CardAccountingLineFormComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.lineForm = this.extendedComponentData.form;
    this.linesTypes = this.extendedComponentData.types;
    this.templateId = this.extendedComponentData.templateId;
    const formValue = this.lineForm.value;
    this.lineToEdit = formValue.id ? formValue : null;
    if (this.lineToEdit) {
      this.MODAL_TITLE = this.translateService.instant(this.labels.editLine);
    }
    if (this.lineToEdit?.accountingLineType) {
      this.selectLineType(this.lineToEdit.accountingLineType);
    }
    this.linesTypesFilteredOptions = this.linesTypesControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const desc = typeof value === 'string' ? value : value?.description;
        return desc ? this.filter(desc as string) : this.linesTypes.slice();
      })
    );
    this.templateAccountingsService
      .getListSimpleLinesByTemplate(this.templateId)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe((response) => {
        this.comboSimpleAccumulatedLines = response;
      });
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.lineForm.touched && this.lineForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | TemplateAccountingItemLineDTO> {
    const formValue = this.lineForm.value;
    const spinner = this.spinnerService.show();
    return this.templateAccountingsService.saveLine(formValue).pipe(
      map((response) => {
        this.globalMessageService.showSuccess({
          message: this.translateService.instant(marker('common.successOperation')),
          actionText: this.translateService.instant(marker('common.close'))
        });
        return response;
      }),
      catchError((error) => {
        this.globalMessageService.showError({
          message: error.message,
          actionText: this.translateService.instant(marker('common.close'))
        });
        return of(false);
      }),
      finalize(() => {
        this.spinnerService.hide(spinner);
      })
    );
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
          disabledFn: () => !(this.lineForm && this.lineForm.touched && this.lineForm.dirty && this.lineForm.valid)
        }
      ]
    };
  }

  public selectLineType(type: AccountingLineTypeDTO): void {
    if (type.id === -999) {
      type = { id: null, description: this.lastLineTypeWritten };
      this.linesTypes.push(type);
    }
    this.lineForm.get('accountingLineType').setValue(type);
    this.updateValueAndValidityForm();
    setTimeout(() => {
      this.linesTypesControl.setValue(type);
    }, 100);
  }

  public updateValueAndValidityForm(): void {
    this.lineForm.updateValueAndValidity();
  }

  public displayFn(type: AccountingLineTypeDTO): string {
    return type && type.description ? type.description : '';
  }

  public compareLines(object1: TemplateAccountingItemLineDTO, object2: TemplateAccountingItemLineDTO) {
    return object1 && object2 && object1.id === object2.id;
  }

  private filter(desc: string): AccountingLineTypeDTO[] {
    if (this.lineForm.get('accountingLineType').value?.description !== desc) {
      this.lineForm.get('accountingLineType').setValue(null);
    }
    if (desc !== this.translateService.instant(marker('administration.templates.accounting.addAsNewLineType'))) {
      this.lastLineTypeWritten = desc;
    } else {
      desc = this.lastLineTypeWritten;
    }
    const filterValue = desc.toLowerCase();
    const options = this.linesTypes.filter((option) => option.description.toLowerCase().includes(filterValue));
    if (options.length) {
      return options;
    } else {
      return [
        { id: -999, description: this.translateService.instant(marker('administration.templates.accounting.addAsNewLineType')) }
      ];
    }
  }
}
