import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowDTO, { WorkFlowStatusEnum } from '@data/models/workflows/workflow-dto';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

export const enum CreateEditWorkflowComponentModalEnum {
  ID = 'create-edit-workflow-dialog-id',
  PANEL_CLASS = 'create-edit-workflow-dialog',
  TITLE = 'workflows.newWorkflow'
}

@Component({
  selector: 'app-create-edit-workflow',
  templateUrl: './create-edit-workflow.component.html',
  styleUrls: ['./create-edit-workflow.component.scss']
})
export class CreateEditWorkflowComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker('workflows.newWorkflow'),
    editWorkflow: marker('workflows.editWorkflow'),
    name: marker('common.name'),
    minLength: marker('errors.minLength'),
    nameRequired: marker('userProfile.nameRequired'),
    manualCreateCard: marker('workflows.manualCreateCard'),
    allowAllMovements: marker('workflows.allowAllMovements')
  };

  public minLength = 3;
  public workflowForm: UntypedFormGroup;
  public workflowEdit: WorkflowDTO;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private workflowService: WorkflowAdministrationService
  ) {
    super(
      CreateEditWorkflowComponentModalEnum.ID,
      CreateEditWorkflowComponentModalEnum.PANEL_CLASS,
      marker(CreateEditWorkflowComponentModalEnum.TITLE)
    );
  }

  ngOnInit(): void {
    this.workflowEdit = this.extendedComponentData;
    if (this.workflowEdit) {
      this.MODAL_TITLE = this.labels.editWorkflow;
    }
    this.initializeForm();
  }
  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.workflowForm.touched && this.workflowForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | WorkflowDTO> {
    const formValue = this.workflowForm.value;
    const spinner = this.spinnerService.show();
    return this.workflowService.createEditWorkflow(formValue).pipe(
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
          disabledFn: () => !(this.workflowForm.touched && this.workflowForm.dirty && this.workflowForm.valid)
        }
      ]
    };
  }

  private initializeForm = (): void => {
    this.workflowForm = this.fb.group({
      id: [this.workflowEdit?.id ? this.workflowEdit.id : null],
      name: [this.workflowEdit?.name ? this.workflowEdit.name : '', [Validators.required, Validators.minLength(this.minLength)]],
      status: [this.workflowEdit?.status ? this.workflowEdit.status : WorkFlowStatusEnum.draft],
      manualCreateCard: [this.workflowEdit?.manualCreateCard ? true : false],
      allowAllMovements: [this.workflowEdit?.allowAllMovements ? true : false]
    });
  };
}
