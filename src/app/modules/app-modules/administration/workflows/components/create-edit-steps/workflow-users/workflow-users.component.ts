import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import UserDTO from '@data/models/user-permissions/user-dto';
import UserFilterDTO, { UserFilterByIdsDTO } from '@data/models/user-permissions/user-filter-dto';
import WorkflowOrganizationDTO from '@data/models/workflow-admin/workflow-organization-dto';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { UserService } from '@data/services/user.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
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
    noDataToShow: marker('errors.noDataToShow')
  };

  public displayedColumns = ['fullName', 'permissionsGroup', 'brand', 'facility', 'department', 'specialty', 'actions'];

  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    private workflowService: WorkflowAdministrationService,
    private spinnerService: ProgressSpinnerDialogService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private userService: UserService
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data?: any): void {
    this.form = this.fb.group({
      wUsers: [data?.wUsers ? data.wUsers : []],
      orUsers: [data?.orUsers ? data.orUsers : []],
      usersByRole: [data?.usersByRole ? data.usersByRole : []]
    });
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    const organization: WorkflowOrganizationDTO = this.workflowsCreateEditAuxService.getFormGroupByStep(0).value;
    const roles = this.workflowsCreateEditAuxService
      .getFormGroupByStep(1)
      .value.roles.filter((role: WorkflowRoleDTO) => role.selected);
    const usersFilter: UserFilterByIdsDTO = {
      brands: [...organization.brands].map((item) => item.id),
      departments: [...organization.departments].map((item) => item.id),
      facilities: [...organization.facilities].map((item) => item.id),
      roles: [...roles].map((item) => item.id),
      specialties: [...organization.specialties].map((item) => item.id),
      email: '',
      search: ''
    };
    return new Promise((resolve, reject) => {
      const resquests = [
        this.workflowService.getWorkflowUsers(this.workflowId).pipe(take(1)),
        this.userService.searchUsers(usersFilter, {
          page: 0,
          size: 10000
        })
      ];

      forkJoin(resquests).subscribe((responses: [WorkflowSubstateUserDTO[], PaginationResponseI<UserDetailsDTO>]) => {
        const wUsers = responses[0] ? responses[0] : [];
        const orUsers = responses[1]?.content
          ? responses[1].content.map((user) => ({
              user,
              id: null,
              extra: false,
              selected: wUsers.find((wUser) => wUser.user.id === user.id) ? true : false
            }))
          : [];
        const data = {
          //Workflow users
          wUsers,
          //All users with organization and roles selected
          orUsers,
          //Users by role
          usersByRole: this.getUsersByRoleAndOtherUsers(orUsers, responses[0])
        };
        this.originalData = data;
        console.log(data);
        this.initForm(this.originalData);
        this.spinnerService.hide(spinner);
        resolve(true);
      });
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

  public addUser(): void {
    //show add user modal
  }

  public showUserDetails(user: WorkflowSubstateUserDTO): void {
    console.log(user);
  }

  public userSelectionChange(user: WorkflowSubstateUserDTO) {
    console.log(user);
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
      console.log('Set to true', check);
      roleData.users.forEach((user) => (user.selected = true));
    } else {
      console.log('Set to false', check);
      roleData.users.forEach((user) => (user.selected = false));
    }
    console.log(roleData);
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
      wUsers.forEach((wUser) => {
        if (!orUsers.find((orUser) => orUser.user.id === wUser.id)) {
          otherUsers.push(wUser);
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
