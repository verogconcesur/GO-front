/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@frontend/custom-dialog';
import { CreateEditLineComponent, CreateEditLineComponentModalEnum } from '../create-edit-line/create-edit-line.component';
import { ConcenetError } from '@app/types/error';
import { CreateEditBlockComponent, CreateEditBlockComponentModalEnum } from '../create-edit-block/create-edit-block.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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
  public expansionPanelOpened: any = {
    'group-config': true,
    'group-items': true
  };
  public accountingToEdit: TemplatesAccountingDTO = null;
  public blockTypes: AccountingBlockTypeDTO[] = [];
  public linesTypes: AccountingLineTypeDTO[] = [];
  public blockFormToEdit: UntypedFormGroup | AbstractControl;
  public lineFormToEdit: UntypedFormGroup | AbstractControl;
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
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private router: Router,
    private templateAccountingsService: TemplatesAccountingsService,
    private createEditAccountingAuxService: CreateEditAccountingAuxService,
    private customDialogService: CustomDialogService
  ) {
    super(
      CreateEditAccountingComponentModalEnum.ID,
      CreateEditAccountingComponentModalEnum.PANEL_CLASS,
      CreateEditAccountingComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {}

  public getData(): void {
    this.accountingForm = null;
    this.blockFormToEdit = null;
    this.lineFormToEdit = null;
    const spinner = this.spinnerService.show();
    const id = this.extendedComponentData?.id ? this.extendedComponentData.id : null;
    if (id) {
      this.MODAL_TITLE = this.translateService.instant(marker('administration.templates.accounting.editTemplate'));
    }
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
          disabledFn: () =>
            !(this.accountingForm && this.accountingForm.touched && this.accountingForm.dirty && this.accountingForm.valid)
        }
      ]
    };
  }

  public getAccountingBlocks(): TemplateAccountingItemDTO[] {
    if (this.accountingForm?.get('templateAccountingItems')?.value?.length) {
      return (this.accountingForm.get('templateAccountingItems').value as TemplateAccountingItemDTO[]).sort(
        (a, b) => a.orderNumber - b.orderNumber
      );
    }
    return [];
  }

  public getLinesForBlock(block: TemplateAccountingItemDTO): TemplateAccountingItemLineDTO[] {
    if (block?.templateAccountingItemLines?.length) {
      return block.templateAccountingItemLines.sort((a, b) => a.orderNumber - b.orderNumber);
    }
    return [];
  }

  public editBlock(block: TemplateAccountingItemDTO): void {
    this.blockFormToEdit = (this.accountingForm.get('templateAccountingItems') as UntypedFormArray).controls.find(
      (c: AbstractControl) => c.value.id === block.id
    );
    this.openBlockDialog();
  }

  public editLine(block: TemplateAccountingItemDTO, line: TemplateAccountingItemLineDTO): void {
    const blockForm = (this.accountingForm.get('templateAccountingItems') as UntypedFormArray).controls.find(
      (c: AbstractControl) => c.value.id === block.id
    );
    this.lineFormToEdit = (blockForm.get('templateAccountingItemLines') as UntypedFormArray).controls.find(
      (l: AbstractControl) => l.value.id === line.id
    );
    this.openLineDialog();
  }

  public deleteBlock(block: TemplateAccountingItemDTO): void {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.templateAccountingsService.deleteBlock(block.id).subscribe({
            next: (response) => {
              this.globalMessageService.showSuccess({
                message: this.translateService.instant(marker('common.successOperation')),
                actionText: this.translateService.instant(marker('common.close'))
              });
              this.getData();
            },
            error: (error: ConcenetError) => {
              this.globalMessageService.showError({
                message: error.message,
                actionText: this.translateService.instant(marker('common.close'))
              });
            }
          });
        }
      });
  }

  public deleteLine(block: TemplateAccountingItemDTO, line: TemplateAccountingItemLineDTO): void {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.templateAccountingsService.deleteLine(line.id).subscribe({
            next: (response) => {
              this.globalMessageService.showSuccess({
                message: this.translateService.instant(marker('common.successOperation')),
                actionText: this.translateService.instant(marker('common.close'))
              });
              this.getData();
            },
            error: (error: ConcenetError) => {
              this.globalMessageService.showError({
                message: error.message,
                actionText: this.translateService.instant(marker('common.close'))
              });
            }
          });
        }
      });
  }

  public newBlock(): void {
    //Creating new block
    const orderNumber = this.accountingForm.get('templateAccountingItems').value.length + 1;
    this.blockFormToEdit = this.createEditAccountingAuxService.creatBlockForm({ orderNumber }, []);
    this.openBlockDialog();
  }

  public newLine(block: TemplateAccountingItemDTO): void {
    //Creating new line
    const orderNumber = block.templateAccountingItemLines.length + 1;
    const templateAccountingItemId = block.id;
    this.lineFormToEdit = this.createEditAccountingAuxService.createLineForm({ orderNumber }, templateAccountingItemId);
    this.openLineDialog();
  }

  public updateValueAndValidityForm(): void {
    this.accountingForm.get('templateAccountingItems').updateValueAndValidity();
    this.accountingForm.updateValueAndValidity();
  }

  public dropBlockItem(event: CdkDragDrop<TemplateAccountingItemDTO[]>) {
    const list = this.getAccountingBlocks();
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    list.map((item: TemplateAccountingItemDTO, index: number) => {
      item.orderNumber = index + 1;
      (this.accountingForm.get('templateAccountingItems') as UntypedFormArray).controls
        .find((c: AbstractControl) => c.value.id === item.id)
        .get('orderNumber')
        .setValue(index + 1);
      return item;
    });
    this.saveAll();
  }

  public dropLineItem(event: CdkDragDrop<TemplateAccountingItemDTO[]>, block: TemplateAccountingItemDTO) {
    const blockForm = (this.accountingForm.get('templateAccountingItems') as UntypedFormArray).controls.find(
      (c: AbstractControl) => c.value.id === block.id
    );
    const list = this.getLinesForBlock(block);
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    list.map((item: TemplateAccountingItemLineDTO, index: number) => {
      item.orderNumber = index + 1;
      (blockForm.get('templateAccountingItemLines') as UntypedFormArray).controls
        .find((c: AbstractControl) => c.value.id === item.id)
        .get('orderNumber')
        .setValue(index + 1);
      return item;
    });
    this.saveAll();
  }

  private initForm(): void {
    this.accountingForm = this.createEditAccountingAuxService.createAccountingForm(
      this.accountingToEdit,
      this.blockTypes,
      this.linesTypes
    );
  }

  private openBlockDialog(): void {
    if (!this.accountingForm?.get('id').value) {
      this.askToSaveFirst();
    } else {
      this.customDialogService
        .open({
          id: CreateEditBlockComponentModalEnum.ID,
          panelClass: CreateEditBlockComponentModalEnum.PANEL_CLASS,
          component: CreateEditBlockComponent,
          extendedComponentData: {
            form: this.blockFormToEdit,
            types: this.blockTypes,
            templateId: this.accountingForm.get('id').value
          },
          disableClose: true,
          width: '720px'
        })
        .pipe(take(1))
        .subscribe((response) => {
          if (response) {
            if (!this.blockFormToEdit.get('id').value) {
              (this.accountingForm.get('templateAccountingItems') as UntypedFormArray).push(this.blockFormToEdit);
            }
            this.saveAll();
          }
        });
    }
  }

  private openLineDialog(): void {
    if (!this.accountingForm?.get('id').value) {
      this.askToSaveFirst();
    } else {
      this.customDialogService
        .open({
          id: CreateEditLineComponentModalEnum.ID,
          panelClass: CreateEditLineComponentModalEnum.PANEL_CLASS,
          component: CreateEditLineComponent,
          extendedComponentData: {
            form: this.lineFormToEdit,
            types: this.linesTypes,
            templateId: this.accountingForm.get('id').value
          },
          disableClose: true,
          width: '720px'
        })
        .pipe(take(1))
        .subscribe((response) => {
          if (response) {
            this.getData();
          }
        });
    }
  }

  private saveAll(): void {
    const spinner = this.spinnerService.show();
    this.templateAccountingsService
      .addOrEditAccounting(this.accountingForm.value)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (res) => {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.getData();
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  private askToSaveFirst(): void {
    this.globalMessageService.showError({
      message: this.translateService.instant(marker('administration.templates.accounting.finishEditing')),
      actionText: this.translateService.instant(marker('common.close'))
    });
  }
}
