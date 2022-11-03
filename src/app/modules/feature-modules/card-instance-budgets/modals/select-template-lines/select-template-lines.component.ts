import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, UntypedFormBuilder } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardBudgetsDTO } from '@data/models/cards/card-budgets-dto';
import { CardBudgetsService } from '@data/services/card-budgets.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

export const enum SelectTemplateLinesComponentModalEnum {
  ID = 'select-template-lines-dialog-id',
  PANEL_CLASS = 'select-template-lines-dialog',
  TITLE = 'cardDetail.budgets.addLines'
}

@Component({
  selector: 'app-select-template-lines',
  templateUrl: './select-template-lines.component.html',
  styleUrls: ['./select-template-lines.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectTemplateLinesComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('cardDetail.budgets.addLines'),
    line: marker('common.line'),
    amount: marker('common.amount')
  };
  public budgetsForm: FormArray;
  public data: CardBudgetsDTO[];
  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private translateService: TranslateService,
    private budgetsService: CardBudgetsService,
    private globalMessageService: GlobalMessageService
  ) {
    super(
      SelectTemplateLinesComponentModalEnum.ID,
      SelectTemplateLinesComponentModalEnum.PANEL_CLASS,
      SelectTemplateLinesComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.data = this.extendedComponentData.data;
    this.initializeForm();
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean | { newLine: boolean }> {
    let formValue: CardBudgetsDTO[] = this.budgetsForm.getRawValue();
    formValue = formValue.filter((budget) => budget.selected);
    if (formValue && formValue.length) {
      const spinner = this.spinnerService.show();
      const config = this.extendedComponentData;
      return this.budgetsService.addLines(config.cardInstanceWorkflowId, config.tabId, formValue).pipe(
        map((response) => {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          return { newLine: false };
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
    } else {
      return of({ newLine: true });
    }
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.import'),
          design: 'raised',
          color: 'primary'
        }
      ]
    };
  }

  private initializeForm(): void {
    this.budgetsForm = this.fb.array([]);
    if (this.data && this.data.length) {
      this.data.forEach((data: CardBudgetsDTO) => {
        this.budgetsForm.push(
          this.fb.group({
            accepted: [false],
            selected: [false],
            amount: [data.amount],
            description: [data.description]
          })
        );
      });
    }
  }
}
