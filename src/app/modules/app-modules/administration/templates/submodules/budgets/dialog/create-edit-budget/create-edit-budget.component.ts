/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TemplatesBudgetDetailsDTO, { TemplateBudgetLinesDTO } from '@data/models/templates-budget-details-dto';
import { TemplatesBudgetsService } from '@data/services/templates-budgets.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { validateDateFormat } from '@shared/utils/validate-date-format-function';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';

export const enum CreateEditBudgetComponentModalEnum {
  ID = 'create-edit-budget-dialog-id',
  PANEL_CLASS = 'create-edit-budget-dialog',
  TITLE = 'administration.templates.budgets.add'
}

@Component({
  selector: 'app-create-edit-budget',
  templateUrl: './create-edit-budget.component.html',
  styleUrls: ['./create-edit-budget.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEditBudgetComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('administration.templates.budgets.add'),
    name: marker('administration.templates.budgets.name'),
    organization: marker('userProfile.organization'),
    edit: marker('administration.templates.budgets.edit'),
    data: marker('userProfile.data'),
    nameRequired: marker('userProfile.nameRequired'),
    required: marker('errors.required'),
    budgetsLines: marker('administration.templates.budgets.lines'),
    newLine: marker('common.newLine'),
    lineConcept: marker('administration.templates.budgets.lineConcept'),
    iniDate: marker('common.dateIni'),
    endDate: marker('common.dateEnd'),
    concept: marker('common.concept'),
    price: marker('common.price')
  };
  public budgetForm: FormGroup;
  public budgetTemplateForm: FormGroup;
  public budgetToEdit: TemplatesBudgetDetailsDTO = null;
  public startDate: Date;
  public endDate: Date;
  constructor(
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private budgetService: TemplatesBudgetsService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService
  ) {
    super(
      CreateEditBudgetComponentModalEnum.ID,
      CreateEditBudgetComponentModalEnum.PANEL_CLASS,
      CreateEditBudgetComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.budgetToEdit = this.extendedComponentData;
    if (this.budgetToEdit) {
      this.MODAL_TITLE = marker('administration.templates.budgets.edit');
    }
    this.initializeForm();
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.budgetForm.touched && this.budgetForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | TemplatesBudgetDetailsDTO> {
    const formValue = this.budgetForm.value;
    if (this.budgetToEdit) {
      formValue.id = this.budgetToEdit.id;
      formValue.template.id = this.budgetToEdit.template.id;
    }
    const spinner = this.spinnerService.show();
    return this.budgetService.addOrEditBudget(formValue).pipe(
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
          type: 'custom',
          label: marker('administration.templates.budgets.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteBudget,
          hiddenFn: () => !this.budgetToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          //TODO: tener en cuenta templateBudgetLines
          disabledFn: () => !(this.budgetForm.touched && this.budgetForm.dirty && this.budgetForm.valid)
        }
      ]
    };
  }

  get templateBudgetLines() {
    return this.budgetForm.controls.templateBudgetLines as FormArray;
  }

  public dropBudgetLine(event: CdkDragDrop<TemplateBudgetLinesDTO[]>) {
    const list = this.templateBudgetLines.value;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    list.map((item: TemplateBudgetLinesDTO, index: number) => {
      item.orderNumber = index;
      return item;
    });
    this.templateBudgetLines.setValue(list);
    this.budgetForm.get('templateBudgetLines').markAsDirty();
    this.budgetForm.get('templateBudgetLines').markAsTouched();
  }

  public addBudgetLine() {
    const budgetLine = this.fb.group({
      amount: [0],
      description: ['', Validators.required],
      id: [null],
      orderNumber: [this.templateBudgetLines.length]
    });
    this.templateBudgetLines.push(budgetLine);
  }

  public deleteBudgetLine(index: number) {
    this.templateBudgetLines.removeAt(index);
    const list = this.templateBudgetLines.value;
    list.map((item: TemplateBudgetLinesDTO, i: number) => {
      item.orderNumber = i;
      return item;
    });
    this.templateBudgetLines.setValue(list);
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.budgetForm.controls;
  }

  public getDateErrorMessage(value: string): string {
    if (!value || value === '') {
      return this.translateService.instant(this.labels.required);
    }
    return validateDateFormat(value, this.translateService);
  }

  private deleteBudget = () => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.budgets.deleteConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.budgetService
            .deleteBudgetById(this.budgetToEdit.template.id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                this.customDialogService.close(this.MODAL_ID, true);
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  private initializeForm(): void {
    const budgetLines: FormGroup[] = [];
    if (this.budgetToEdit?.templateBudgetLines?.length > 0) {
      this.budgetToEdit.templateBudgetLines
        .sort((a, b) => a.orderNumber - b.orderNumber)
        .forEach((line) => {
          const budgetLine = this.fb.group({
            amount: [line.amount],
            description: [line.description, Validators.required],
            id: [line.id],
            orderNumber: [line.orderNumber]
          });
          budgetLines.push(budgetLine);
        });
    }
    this.budgetTemplateForm = this.fb.group({
      name: [this.budgetToEdit ? this.budgetToEdit.template.name : null, Validators.required],
      brands: [this.budgetToEdit ? this.budgetToEdit.template.brands : null, Validators.required],
      facilities: [this.budgetToEdit ? this.budgetToEdit.template.facilities : null, Validators.required],
      departments: [this.budgetToEdit ? this.budgetToEdit.template.departments : null],
      specialties: [this.budgetToEdit ? this.budgetToEdit.template.specialties : null]
    });
    this.budgetForm = this.fb.group({
      endDate: [this.budgetToEdit?.endDate ? new Date(this.budgetToEdit.endDate) : null, Validators.required],
      startDate: [this.budgetToEdit?.startDate ? new Date(this.budgetToEdit.startDate) : null, Validators.required],
      templateBudgetLines: this.fb.array(budgetLines, [Validators.required]),
      template: this.budgetTemplateForm
    });
  }
}
