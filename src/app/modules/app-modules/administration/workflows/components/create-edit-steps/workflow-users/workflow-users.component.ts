import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { UserFilterByIdsDTO } from '@data/models/user-permissions/user-filter-dto';
import WorkflowOrganizationDTO from '@data/models/workflow-admin/workflow-organization-dto';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { UserService } from '@data/services/user.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import {
  CreateEditUserComponent,
  CreateEditUserComponentModalEnum
} from '@modules/app-modules/administration/users/components/create-edit-user/create-edit-user.component';
import {
  UserSearcherDialogComponent,
  UserSearcherDialogComponentModalEnum
} from '@modules/feature-modules/user-searcher-dialog/user-searcher-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';

@Component({
  selector: 'app-workflow-users',
  templateUrl: './workflow-users.component.html',
  styleUrls: ['./workflow-users.component.scss']
})
export class WorkflowUsersComponent extends WorkflowStepAbstractClass implements OnInit {
  @Input() workflowId: number;
  @Input() stepIndex: number;

  public labels = {
    users: marker('common.users'),
    addUser: marker('user.add'),
    fullName: marker('users.fullName'),
    permissionsGroup: marker('users.permissionsGroup'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    actions: marker('common.actions'),
    noDataToShow: marker('errors.noDataToShow'),
    others: marker('common.others'),
    sendPermission: marker('common.sendPermission'),
    movePermission: marker('common.movePermission'),
    withPermission: marker('common.withPermission'),
    withoutPermission: marker('common.withoutPermission')
  };

  public displayedColumns = [
    'fullName',
    'permissionsGroup',
    'brand',
    'facility',
    'department',
    'specialty',
    'actions',
    'move',
    'send'
  ];
  private usersFilter: UserFilterByIdsDTO;

  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    private workflowService: WorkflowAdministrationService,
    private spinnerService: ProgressSpinnerDialogService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private userService: UserService,
    private customDialogService: CustomDialogService,
    private globalMessageService: GlobalMessageService
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data?: any): void {
    if (data?.orUsers) {
      data.orUsers.forEach((user: WorkflowSubstateUserDTO) => {
        const findUser = data.wUsers.find((wUser: WorkflowSubstateUserDTO) => wUser.user.id === user.user.id);
        user.selected = false;
        if (findUser) {
          user.selected = true;
          user.id = findUser.id;
        }
      });
    }
    this.form = this.fb.group({
      wUsers: [data?.wUsers ? data.wUsers : [], [Validators.required]],
      orUsers: [data?.orUsers ? data.orUsers : []]
    });
    if (this.originalData?.usersByRole?.length && data?.orUsers && data?.wUsers) {
      this.originalData.usersByRole = this.getUsersByRoleAndOtherUsers(data.orUsers, data.wUsers);
    }
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    const organization: WorkflowOrganizationDTO = this.workflowsCreateEditAuxService.getFormGroupByStep(0).value;
    const roles = this.workflowsCreateEditAuxService
      .getFormOriginalData(1) // Por alguna razón el formulario no está recargando correctamente al guardar en este paso
      .roles.filter((role: WorkflowRoleDTO) => role.selected);
    this.usersFilter = {
      brands: [...(organization.brands ? organization.brands : [])].map((item) => item.id),
      departments: [...(organization.departments ? organization.departments : [])].map((item) => item.id),
      facilities: [...(organization.facilities ? organization.facilities : [])].map((item) => item.id),
      roles: [...(roles ? roles : [])].map((item) => item.id),
      specialties: [...(organization.specialties ? organization.specialties : [])].map((item) => item.id),
      email: '',
      search: ''
    };
    return new Promise((resolve, reject) => {
      const resquests = [
        this.workflowService.getWorkflowUsers(this.workflowId).pipe(take(1)),
        this.userService
          .searchUsers(this.usersFilter, {
            page: 0,
            size: 10000
          })
          .pipe(take(1))
      ];

      forkJoin(resquests).subscribe((responses: [WorkflowSubstateUserDTO[], PaginationResponseI<UserDetailsDTO>]) => {
        const wUsers = responses[0] ? [...responses[0]] : [];
        const orUsers = responses[1]?.content
          ? [...responses[1].content].map((user) => ({
              user,
              id: null,
              extra: false,
              selected: wUsers.find((wUser) => wUser.user.id === user.id) ? true : false,
              hideMoveButton: wUsers.find((wUser) => wUser.user.id === user.id)
                ? wUsers.find((wUser) => wUser.user.id === user.id).hideMoveButton
                : false,
              hideSendButton: wUsers.find((wUser) => wUser.user.id === user.id)
                ? wUsers.find((wUser) => wUser.user.id === user.id).hideSendButton
                : false
            }))
          : [];
        this.originalData = {
          //Workflow users
          wUsers,
          //All users with organization and roles selected
          orUsers,
          //Users by role
          usersByRole: this.getUsersByRoleAndOtherUsers(orUsers, wUsers)
        };
        this.spinnerService.hide(spinner);
        resolve(true);
      });
    });
  }

  public async saveStep(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      this.workflowService
        .postWorkflowUsers(this.workflowId, this.form.get('wUsers').value)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe({
          next: (response) => {
            resolve(true);
          },
          error: (error: ConcenetError) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            resolve(false);
          }
        });
    });
  }

  public allHidden(field: 'hideMoveButton' | 'hideSendButton', users: WorkflowSubstateUserDTO[]): boolean {
    return users.reduce((acc, user) => {
      if (user.selected && acc) {
        acc = user[field];
      }
      return acc;
    }, true);
  }
  public allVisible(field: 'hideMoveButton' | 'hideSendButton', users: WorkflowSubstateUserDTO[]): boolean {
    return users.reduce((acc, user) => {
      if (user.selected && acc) {
        acc = !user[field];
      }
      return acc;
    }, true);
  }
  public changePermission(field: 'hideMoveButton' | 'hideSendButton', users: WorkflowSubstateUserDTO[]): void {
    let changeTo = true;
    if (users.length === 1) {
      changeTo = !users[0][field];
    } else {
      changeTo = !this.allHidden(field, users);
    }
    users.forEach((user) => {
      if (user.selected) {
        user[field] = changeTo;
      }
    });
    this.userSelectionChange();
  }

  public addUser(): void {
    this.customDialogService
      .open({
        id: UserSearcherDialogComponentModalEnum.ID,
        panelClass: UserSearcherDialogComponentModalEnum.PANEL_CLASS,
        component: UserSearcherDialogComponent,
        extendedComponentData: { filter: this.usersFilter, multiple: true },
        disableClose: true,
        width: '50%',
        maxWidth: '900px'
      })
      .pipe(take(1))
      .subscribe(async (response) => {
        if (response && Array.isArray(response) && response.length) {
          const usersNotFound: UserDetailsDTO[] = [...response];
          const usersIdsToAdd = [...response].map((user) => user.id);
          let emptyRoleGroup: { role: RoleDTO; users: WorkflowSubstateUserDTO[] } = { role: null, users: [] };
          let addEmptyRoleGroup = true;
          this.originalData.usersByRole.forEach((roleUsers: { role: RoleDTO; users: WorkflowSubstateUserDTO[] }) => {
            if (!roleUsers.role) {
              emptyRoleGroup = roleUsers;
              addEmptyRoleGroup = false;
            }
            roleUsers.users.forEach((user: WorkflowSubstateUserDTO) => {
              if (usersIdsToAdd.indexOf(user.user.id) >= 0) {
                user.selected = true;
                usersIdsToAdd.splice(usersIdsToAdd.indexOf(user.user.id), 1);
                usersNotFound.splice(usersIdsToAdd.indexOf(user.user.id), 1);
              }
            });
          });
          usersNotFound.forEach((user: UserDetailsDTO) => {
            emptyRoleGroup.users.push({
              user,
              extra: true, //DGDC TODO: Si extra true ¿no sirve el selected?
              id: null,
              selected: true
            });
          });
          if (addEmptyRoleGroup) {
            this.originalData.usersByRole.push(emptyRoleGroup);
            this.userSelectionChange();
          } else {
            const copyUsersByRole = [...this.originalData.usersByRole];
            this.originalData.usersByRole = [];
            setTimeout(() => {
              this.originalData.usersByRole = copyUsersByRole.map(
                (usersByRole: { role: RoleDTO; users: WorkflowSubstateUserDTO[] }) => {
                  if (usersByRole.role) {
                    return usersByRole;
                  } else {
                    return emptyRoleGroup;
                  }
                }
              );
              this.userSelectionChange();
            }, 50);
          }
        }
      });
  }

  public showUserDetails(user: WorkflowSubstateUserDTO) {
    this.customDialogService
      .open({
        id: CreateEditUserComponentModalEnum.ID,
        panelClass: CreateEditUserComponentModalEnum.PANEL_CLASS,
        component: CreateEditUserComponent,
        extendedComponentData: user ? user.user : null,
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe(async (response) => {
        if (response) {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          if (this.form.valid && !this.form.dirty && this.form.untouched) {
            await this.getWorkflowStepData();
            this.initForm(this.originalData);
          } else {
            setTimeout(() => {
              this.globalMessageService.showError({
                message: this.translateService.instant(marker('errors.avoidReloadUnsavedChanges')),
                actionText: this.translateService.instant(marker('common.close'))
              });
            }, 1000);
          }
        }
      });
  }

  public userSelectionChange() {
    this.form
      .get('wUsers')
      .setValue(
        [...this.originalData.usersByRole].reduce(
          (prev: WorkflowSubstateUserDTO[], curr: { role: RoleDTO; users: WorkflowSubstateUserDTO[] }) => [
            ...prev,
            ...curr.users.filter((user: WorkflowSubstateUserDTO) => user.selected)
          ],
          []
        )
      );
    this.form.markAsDirty();
    this.form.markAsTouched();
  }

  public areAllRolesUsersSelected(roleData: { role: RoleDTO; users: WorkflowSubstateUserDTO[] }): boolean {
    return roleData != null && roleData.users.every((t) => t.selected);
  }

  public areSomeRolesUsersSelected(roleData: { role: RoleDTO; users: WorkflowSubstateUserDTO[] }): boolean {
    return roleData != null && roleData.users.find((t) => t.selected) && !roleData.users.every((t) => t.selected);
  }

  public countUsersSelected(users: WorkflowSubstateUserDTO[]) {
    return users.filter((user) => user.selected).length;
  }

  public setRolesUsersSelection(check: boolean | string, roleData: { role: RoleDTO; users: WorkflowSubstateUserDTO[] }) {
    if (check && check !== 'false') {
      roleData.users.forEach((user) => (user.selected = true));
    } else {
      roleData.users.forEach((user) => (user.selected = false));
    }
    this.userSelectionChange();
  }

  public getUserOrganizationLabel = (data: BrandDTO[] | FacilityDTO[] | DepartmentDTO[] | SpecialtyDTO[]): string => {
    let label = '';
    data = data && Array.isArray(data) ? data : [];
    data.forEach((item: BrandDTO | FacilityDTO | DepartmentDTO | SpecialtyDTO) => {
      if (label) {
        label += ', ';
      }
      label += item.name;
    });
    return label;
  };

  private getUsersByRoleAndOtherUsers(
    orUsers: WorkflowSubstateUserDTO[],
    wUsers: WorkflowSubstateUserDTO[]
  ): { role: RoleDTO; users: WorkflowSubstateUserDTO[] }[] {
    const roles = [...orUsers].reduce((prev, curr) => {
      if (!prev.find((role) => role.id === curr.user.role.id)) {
        prev.push(curr.user.role);
      }
      return prev;
    }, []);
    const usersByRole: { role: RoleDTO; users: WorkflowSubstateUserDTO[] }[] = [];
    roles.forEach((role: RoleDTO) => {
      usersByRole.push({
        role,
        users: [...orUsers].filter((user) => user.user.role.id === role.id)
      });
    });
    if (wUsers) {
      const otherUsers: WorkflowSubstateUserDTO[] = [];
      [...wUsers].forEach((wUser) => {
        if (!orUsers.find((orUser) => orUser.user.id === wUser.user.id)) {
          otherUsers.push({
            ...wUser,
            selected: true,
            hideMoveButton: false,
            hideSendButton: false
          });
        }
      });
      if (otherUsers.length) {
        usersByRole.push({
          role: null,
          users: otherUsers
        });
      }
    }
    return usersByRole;
  }
}
