import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
export const enum WfEditStateComponentModalEnum {
  ID = 'edit-state-dialog-id',
  PANEL_CLASS = 'edit-state-dialog',
  TITLE = 'workflows.editState'
}
@Component({
  selector: 'app-wf-edit-state-dialog',
  templateUrl: './wf-edit-state-dialog.component.html',
  styleUrls: ['./wf-edit-state-dialog.component.scss']
})
export class WfEditStateDialogComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    name: marker('workflows.stateName'),
    nameRequired: marker('errors.required'),
    front: marker('workflows.state-front'),
    frontDescription: marker('workflows.state-frontDescription'),
    hideBoard: marker('workflows.state-hideBoard'),
    hideBoardDescription: marker('workflows.state-hideBoardDescription'),
    anchor: marker('workflows.state-anchor'),
    anchorDescription: marker('workflows.state-anchorDescription'),
    lockInMoves: marker('workflows.state-lockInMoves'),
    lockInMovesDescription: marker('workflows.state-lockInMovesDescription'),
    color: marker('workflows.state-color'),
    noColorSelected: marker('workflows.state-no-color-selected'),
    resetColor: marker('workflows.state-reset-color')
  };
  public form: UntypedFormGroup;
  private originalData: WorkflowStateDTO;
  private workflowId: number;

  constructor(
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private wStatesService: WorkflowAdministrationStatesSubstatesService,
    private globalMessageService: GlobalMessageService
  ) {
    super(WfEditStateComponentModalEnum.ID, WfEditStateComponentModalEnum.PANEL_CLASS, marker('workflows.editState'));
  }

  ngOnInit(): void {
    this.originalData = this.extendedComponentData.state;
    this.workflowId = this.extendedComponentData.workflowId;
    this.initForm(this.originalData);
  }

  public initForm(data: WorkflowStateDTO): void {
    this.form = this.fb.group({
      anchor: [data?.anchor ? data.anchor : false],
      color: [data.color ? data.color : null],
      front: [data.front ? data.front : false],
      hideBoard: [data.hideBoard ? data.hideBoard : false],
      locked: [data.locked ? data.locked : false],
      name: [data.name ? data.name : '', [Validators.required]]
    });
  }

  public isStateColorSetted(): boolean {
    return this.form?.get('color').value !== null;
  }

  public resetColor(): void {
    this.form.get('color').setValue(null);
    this.form.markAsDirty();
    this.form.markAsTouched();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.form.touched && this.form.dirty) {
      return this.confirmDialogService
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('common.unsavedChangesExit'))
        })
        .pipe(take(1));
    }
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean> {
    const state = { ...this.originalData, ...this.form.value };
    const spinner = this.spinnerService.show();
    return this.wStatesService.createWorkflowState(this.workflowId, state).pipe(
      take(1),
      map((response) => {
        this.globalMessageService.showSuccess({
          message: this.translateService.instant(marker('common.successOperation')),
          actionText: this.translateService.instant(marker('common.close'))
        });
        return true;
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
          disabledFn: () => !(this.form.touched && this.form.dirty && this.form.valid)
        }
      ]
    };
  }
}
