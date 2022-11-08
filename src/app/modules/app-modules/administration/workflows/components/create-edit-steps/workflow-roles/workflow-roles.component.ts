import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';

@Component({
  selector: 'app-workflow-roles',
  templateUrl: './workflow-roles.component.html',
  styleUrls: ['./workflow-roles.component.scss']
})
export class WorkflowRolesComponent extends WorkflowStepAbstractClass {
  @Input() workflowId: number;
  @Input() stepIndex: number;

  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    private spinnerService: ProgressSpinnerDialogService
  ) {
    super(workflowsCreateEditAuxService);
  }

  public initForm(): void {
    this.form = this.fb.group({
      idRole: [null, [Validators.required]]
    });
  }

  public setFormOriginalValues(): void {
    this.form.get('idRole').setValue(this.originalData.idRole);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      this.originalData = { idRole: null };
      this.spinnerService.hide(spinner);
      resolve(true);
    });
  }

  public async saveStep(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      this.spinnerService.hide(spinner);
      resolve(true);
      //resolve(false) => si se produce error
    });
  }
}
