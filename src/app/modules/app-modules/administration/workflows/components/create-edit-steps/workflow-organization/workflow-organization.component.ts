import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';

@Component({
  selector: 'app-workflow-organization',
  templateUrl: './workflow-organization.component.html',
  styleUrls: ['./workflow-organization.component.scss']
})
export class WorkflowOrganizationComponent extends WorkflowStepAbstractClass {
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
      id: [null, [Validators.required]]
    });
  }

  public setFormOriginalValues(): void {
    this.form.get('id').setValue(this.originalData.id);
    this.form.markAsPristine();
    this.form.markAsUntouched();
    console.log(this.originalData, this.form);
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      this.originalData = { id: 88 };
      this.spinnerService.hide(spinner);
      resolve(true);
    });
  }

  public async saveStep(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.spinnerService.hide(spinner);
        resolve(true);
      }, 5000);
      //resolve(false) => si se produce error
    });
  }
}
