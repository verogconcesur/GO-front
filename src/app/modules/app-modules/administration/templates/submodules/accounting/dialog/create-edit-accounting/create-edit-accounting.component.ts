/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import {
  AccountingBlockTypeDTO,
  AccountingLineTypeDTO,
  TemplateAccountingItemDTO,
  TemplateAccountingItemLineDTO,
  TemplatesAccountingDTO
} from '@data/models/templates/templates-accounting-dto';
import { TemplatesAccountingsService } from '@data/services/templates-accountings.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, catchError, finalize, forkJoin, map, of, take } from 'rxjs';
import { CreateEditAccountingAuxService } from './create-edit-accounting-aux.service';
import { RouteConstants } from '@app/constants/route.constants';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';

export const enum CreateEditAccountingComponentModalEnum {
  ID = 'create-edit-accounting-dialog-id',
  PANEL_CLASS = 'create-edit-accounting-dialog',
  TITLE = 'administration.templates.accounting.new'
}

@Component({
  selector: 'app-create-edit-accounting',
  templateUrl: './create-edit-accounting.component.html',
  styleUrls: ['./create-edit-accounting.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEditAccountingComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public accountingForm: UntypedFormGroup;
  public expansionPanelOpened: any = {};
  public accountingToEdit: TemplatesAccountingDTO = null;
  public blockTypes: AccountingBlockTypeDTO[] = [];
  public linesTypes: AccountingLineTypeDTO[] = [];
  public blockFormToEdit: UntypedFormGroup;
  public lineFormToEdit: UntypedFormGroup;
  public labels: any = {
    newAccounting: marker('administration.templates.accounting.new'),
    accountingConfig: marker('administration.templates.accounting.config'),
    itemsInTemplate: marker('administration.templates.accounting.itemsInTemplate'),
    name: marker('administration.templates.accounting.name'),
    nameRequired: marker('userProfile.nameRequired'),
    block: marker('administration.templates.accounting.block'),
    line: marker('administration.templates.accounting.line'),
    newLine: marker('administration.templates.accounting.newLine'),
    newBlock: marker('administration.templates.accounting.newBlock')
  };

  constructor(
    private translateService: TranslateService,
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private router: Router,
    private templateAccountingsService: TemplatesAccountingsService,
    private createEditAccountingAuxService: CreateEditAccountingAuxService,
    private route: ActivatedRoute
  ) {
    super(
      CreateEditAccountingComponentModalEnum.ID,
      CreateEditAccountingComponentModalEnum.PANEL_CLASS,
      CreateEditAccountingComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    const id = this.extendedComponentData?.id ? this.extendedComponentData.id : null;
    if (id) {
      forkJoin([
        this.templateAccountingsService.getListAccountingBlockTypes(),
        this.templateAccountingsService.getListAccountingLineTypes(),
        this.templateAccountingsService.findById(id)
      ])
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe(
          (responses: [AccountingBlockTypeDTO[], AccountingLineTypeDTO[], TemplatesAccountingDTO]) => {
            this.blockTypes = responses[0];
            this.linesTypes = responses[1];
            this.accountingToEdit = responses[2];
            this.initForm();
            this.getTitle();
          },
          (errors) => {
            this.globalMessageService.showError({
              message: this.translateService.instant(errors[1]?.message),
              actionText: this.translateService.instant(marker('common.close'))
            });
            this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.ACCOUNTING]);
          }
        );
    } else {
      forkJoin([
        this.templateAccountingsService.getListAccountingBlockTypes(),
        this.templateAccountingsService.getListAccountingLineTypes()
      ])
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe(
          (responses: [AccountingBlockTypeDTO[], AccountingLineTypeDTO[]]) => {
            this.blockTypes = responses[0];
            this.linesTypes = responses[1];
            this.accountingToEdit = null;
            this.initForm();
            this.getTitle();
          },
          (errors) => {
            this.globalMessageService.showError({
              message: this.translateService.instant(errors[1]?.message),
              actionText: this.translateService.instant(marker('common.close'))
            });
            this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.ACCOUNTING]);
          }
        );
      this.initForm();
    }
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.accountingForm.touched && this.accountingForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | TemplatesAccountingDTO> {
    const formValue = this.accountingForm.value;
    if (this.accountingToEdit) {
      formValue.id = this.accountingToEdit.id;
      formValue.template.id = this.accountingToEdit.template.id;
    }
    const spinner = this.spinnerService.show();
    return this.templateAccountingsService.addOrEditAccounting(formValue).pipe(
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
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () =>
            !(this.accountingForm && this.accountingForm.touched && this.accountingForm.dirty && this.accountingForm.valid)
        }
      ]
    };
  }

  public getTitle = (): void => {
    if (this.accountingToEdit) {
      this.MODAL_TITLE = this.accountingForm?.value?.template?.name
        ? this.accountingForm?.value?.template?.name
        : this.accountingToEdit.template.name;
      return;
    }
    if (this.accountingForm?.value?.template?.name) {
      this.MODAL_TITLE =
        this.translateService.instant(this.labels.newAccounting) + ': ' + this.accountingForm.value.template.name;
      return;
    }
    this.MODAL_TITLE = this.translateService.instant(this.labels.newAccounting);
  };

  public getAccountingBlocks(): TemplateAccountingItemDTO[] {
    if (this.accountingForm?.get('templateAccountingItems')?.value?.length) {
      return (this.accountingForm.get('templateAccountingItems').value as TemplateAccountingItemDTO[]).sort(
        (a, b) => a.orderNumber - b.orderNumber
      );
    }
    return [];
  }

  public edit(block: TemplateAccountingItemDTO, line?: TemplateAccountingItemLineDTO): void {
    console.log(block, line);
  }

  public delete(block: TemplateAccountingItemDTO, line?: TemplateAccountingItemLineDTO): void {
    console.log(block, line);
  }

  public newItem(block?: TemplateAccountingItemDTO): void {
    if (block) {
      //Creating new line
      const orderNumber = block.templateAccountingItemLines.length + 1;
      const templateAccountingItemId = this.accountingToEdit?.template?.id ? this.accountingToEdit.template.id : null;
      this.lineFormToEdit = this.createEditAccountingAuxService.createLineForm({ orderNumber }, templateAccountingItemId);
      (this.accountingForm.get('templateAccountingItems') as UntypedFormArray).controls.forEach((ctrl: AbstractControl) => {
        if (ctrl.get('id').value === block.id) {
          (ctrl.get('templateAccountingItemLines') as UntypedFormArray).push(this.lineFormToEdit);
        }
      });
    } else {
      //Creating new block
      const orderNumber = this.accountingForm.get('templateAccountingItems').value.length + 1;
      this.blockFormToEdit = this.createEditAccountingAuxService.creatBlockForm({ orderNumber }, []);
      (this.accountingForm.get('templateAccountingItems') as UntypedFormArray).push(this.blockFormToEdit);
    }
  }

  public updateValueAndValidityForm(): void {
    this.accountingForm.get('templateAccountingItems').updateValueAndValidity();
    this.accountingForm.updateValueAndValidity();
    this.getTitle();
  }

  private initForm(): void {
    this.accountingForm = this.createEditAccountingAuxService.createAccountingForm(
      this.accountingToEdit,
      this.blockTypes,
      this.linesTypes
    );
    // console.log(this.accountingForm);
    // console.log(this.accountingForm.value);
  }
}
