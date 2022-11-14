import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import { RoleService } from '@data/services/role.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
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
  public labels = {
    roles: marker('common.roles'),
    users: marker('common.users')
  };
  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    public workflowService: WorkflowAdministrationService,
    public roleService: RoleService,
    private logger: NGXLogger
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }
  public get roles() {
    return this.form.get('roles') as FormArray;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: any): void {
    this.form = this.fb.group({
      roles: this.fb.array([])
    });
    if (data && data.length) {
      data.forEach((role: WorkflowRoleDTO) => {
        (this.form.get('roles') as FormArray).push(this.generateRoleForm(role));
      });
    }
    this.originalData = this.form.getRawValue()?.roles;
  }

  public generateRoleForm(role: WorkflowRoleDTO): FormGroup {
    return this.fb.group({
      id: [role?.id],
      name: [role?.name],
      selected: [role?.selected],
      userCount: [role?.userCount],
      workflowId: [role?.workflowId]
    });
  }

  public selectItem(item: FormGroup): void {
    item.get('selected').setValue(!item.get('selected').value);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      this.workflowService
        .getWorkflowRoles(this.workflowId)
        .pipe(take(1))
        .subscribe((res) => {
          this.initForm(res);
          this.spinnerService.hide(spinner);
          resolve(true);
        });
    });
  }

  public async saveStep(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      const listRoles = this.form.getRawValue().roles.filter((role: WorkflowRoleDTO) => role.selected);
      this.workflowService
        .postWorkflowRoles(this.workflowId, listRoles)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
            resolve(true);
          })
        )
        .subscribe({
          next: (response) => {
            console.log(response);
          },
          error: (err) => {
            this.logger.error(err);
            resolve(false);
          }
        });
    });
  }
}
