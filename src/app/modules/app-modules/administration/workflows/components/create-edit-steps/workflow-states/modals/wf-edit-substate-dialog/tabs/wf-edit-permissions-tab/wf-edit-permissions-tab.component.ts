import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import RoleDTO from '@data/models/user-permissions/role-dto';
import UserDTO from '@data/models/user-permissions/user-dto';
import { WorkFlowPermissionsEnum } from '@data/models/workflow-admin/workflow-card-tab-permissions-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import _ from 'lodash';
import { NGXLogger } from 'ngx-logger';
import { forkJoin, Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { WEditSubstateFormAuxService } from '../../aux-service/wf-edit-substate-aux.service';
import { WfEditSubstateAbstractTabClass } from '../wf-edit-substate-abstract-tab-class';

@UntilDestroy()
@Component({
  selector: 'app-wf-edit-permissions-tab',
  templateUrl: './wf-edit-permissions-tab.component.html',
  styleUrls: ['./wf-edit-permissions-tab.component.scss']
})
export class WfEditPermissionsTabComponent extends WfEditSubstateAbstractTabClass implements OnInit {
  public labels = {
    title: marker('workflows.state-roleTitle'),
    roleList: marker('workflows.state-roleList'),
    all: marker('common.all'),
    whoSees: marker('common.whoSees'),
    hide: marker('common.HIDE'),
    show: marker('common.SHOW'),
    edit: marker('common.EDIT')
  };
  public roleList: RoleDTO[];
  public roleSelected: RoleDTO;
  public userPermissions: WorkflowSubstateUserDTO[];
  public userList: WorkflowSubstateUserDTO[];
  public allPermisionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public editSubstateAuxService: WEditSubstateFormAuxService,
    private substatesService: WorkflowAdministrationStatesSubstatesService,
    public workflowService: WorkflowAdministrationService,
    public spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {
    super(editSubstateAuxService, spinnerService);
  }
  get users(): FormArray {
    return this.form.get('users') ? (this.form.get('users') as FormArray) : null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: [WorkflowSubstateUserDTO[], WorkflowSubstateUserDTO[]]): void {
    this.roleList = null;
    this.roleSelected = null;
    this.userPermissions = data[0];
    this.userList = data[1];
    const form = this.fb.group({
      users: this.fb.array([])
    });
    this.userList.forEach((userSub: WorkflowSubstateUserDTO) => {
      const permission = this.userPermissions.find((perm: WorkflowSubstateUserDTO) => perm.workflowUserId === userSub.id);
      if (permission) {
        (form.get('users') as FormArray).push(
          this.fb.group({
            id: [permission.id],
            user: [userSub.user],
            // permissionType: [userSub.user.showAll ? WorkFlowPermissionsEnum.edit : permission.permissionType],
            permissionType: [permission.permissionType],
            workflowSubstateId: [permission.workflowSubstateId],
            workflowUserId: [permission.workflowUserId]
          })
        );
      } else {
        (form.get('users') as FormArray).push(
          this.fb.group({
            id: [],
            user: [userSub.user],
            // permissionType: [userSub.user.showAll ? WorkFlowPermissionsEnum.edit : WorkFlowPermissionsEnum.hide],
            permissionType: [WorkFlowPermissionsEnum.hide],
            workflowSubstateId: [this.substate.id],
            workflowUserId: [userSub.id]
          })
        );
      }
    });
    this.allPermisionForm = this.fb.group({ permission: [''] });
    this.roleList = this.userList.map((userSub: WorkflowSubstateUserDTO) => userSub.user.role) as RoleDTO[];
    this.roleList = _.uniqBy(this.roleList, 'id');
    this.editSubstateAuxService.setFormGroupByTab(form, this.tabId);
    this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
    this.form.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.allPermisionForm.get('permission').setValue('');
    });
    this.roleSelected = this.roleList[0];
  }
  public selectRole(role: RoleDTO): void {
    if (role.id !== this.roleSelected.id) {
      this.roleSelected = role;
      this.allPermisionForm.get('permission').setValue('');
    }
  }
  public getUserFullName(user: WorkflowSubstateUserDTO): string {
    if (user?.user) {
      const userdto: UserDTO = user.user;
      if (userdto.fullName) {
        return userdto.fullName;
      } else {
        let fullname = '';
        if (userdto.name) {
          fullname += userdto.name;
        }
        if (userdto.firstName) {
          fullname += ` ${userdto.firstName}`;
        }
        if (userdto.lastName) {
          fullname += ` ${userdto.lastName}`;
        }
        return fullname;
      }
    }
    return '';
  }
  public changeAllPermissions(permission: string): void {
    let users = this.form.get('users').getRawValue();
    users = users.map((userWk: WorkflowSubstateUserDTO) => {
      // if (userWk.user.role.id === this.roleSelected.id && !userWk.user.showAll) {
      if (userWk.user.role.id === this.roleSelected.id) {
        userWk.permissionType = permission;
      }
      return userWk;
    });
    this.form.get('users').patchValue(users);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }
  public saveData(): void {
    const spinner = this.spinnerService.show();
    this.substatesService
      .saveWorkflowSubstatePermissions(this.workflowId, this.substate.id, this.form.getRawValue().users)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (response: WorkflowSubstateUserDTO[]) => {
          this.initForm([response, this.userList]);
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
        },
        error: (error: ConcenetError) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getData(): Observable<any> {
    const request = [
      this.substatesService.getWorkflowSubstatePermissions(this.workflowId, this.substate.id).pipe(take(1)),
      this.workflowService.getWorkflowUsers(this.workflowId).pipe(take(1))
    ];
    return forkJoin(request);
  }
}
