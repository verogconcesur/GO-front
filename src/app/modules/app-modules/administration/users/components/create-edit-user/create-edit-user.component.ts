/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PermissionsDTO from '@data/models/user-permissions/permissions-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { PermissionsService } from '@data/services/permissions.service';
import { RoleService } from '@data/services/role.service';
import { UserService } from '@data/services/user.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import ConfirmPasswordValidator from '@shared/validators/confirm-password.validator';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';
import { UsersPermissionsComponent } from '../users-permissions/users-permissions.component';

export const enum CreateEditUserComponentModalEnum {
  ID = 'create-edit-user-dialog-id',
  PANEL_CLASS = 'create-edit-user-dialog',
  TITLE = 'user.add'
}

@Component({
  selector: 'app-create-edit-user',
  templateUrl: './create-edit-user.component.html',
  styleUrls: ['./create-edit-user.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEditUserComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  @ViewChild('permissionsListComponent') permissionsListComponent: UsersPermissionsComponent;
  public labels = {
    title: marker('user.add'),
    name: marker('userProfile.name'),
    firstName: marker('userProfile.firstName'),
    lastName: marker('userProfile.lastName2'),
    code: marker('userProfile.code'),
    userId: marker('userProfile.userId'),
    userName: marker('userProfile.userName'),
    email: marker('userProfile.email'),
    role: marker('userProfile.role'),
    nick: marker('userProfile.nick'),
    organization: marker('userProfile.organization'),
    edit: marker('userProfile.edit'),
    sign: marker('userProfile.sign'),
    data: marker('userProfile.data'),
    nameRequired: marker('userProfile.nameRequired'),
    firstNameRequired: marker('userProfile.firstNameRequired'),
    password: marker('login.password'),
    password1: marker('login.restorePassword.password1'),
    password2: marker('login.restorePassword.password2'),
    passwordRequired: marker('login.restorePassword.passwordRequired'),
    passwordPatternError: marker('login.restorePassword.passwordPatternError'),
    passwordPattern: marker('login.restorePassword.passwordPattern'),
    passwordMatch: marker('login.restorePassword.passwordMatch'),
    permissions: marker('users.permissions'),
    selectRoleFirst: marker('user.selectRoleFirst'),
    permissionsInheritFromRole: marker('user.permissionsInheritFromRole'),
    reset: marker('common.reset'),
    userPermissions: marker('user.userPermissions'),
    required: marker('errors.required'),
    emailError: marker('errors.emailPattern')
  };
  public userPermissions: { permission: PermissionsDTO; checked: boolean }[] = [];
  public userForm: UntypedFormGroup;
  public rolesAsyncList: Observable<RoleDTO[]>;
  public userToEdit: UserDetailsDTO = null;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private userService: UserService,
    private globalMessageService: GlobalMessageService,
    private roleService: RoleService,
    private permissionsService: PermissionsService,
    private customDialogService: CustomDialogService
  ) {
    super(
      CreateEditUserComponentModalEnum.ID,
      CreateEditUserComponentModalEnum.PANEL_CLASS,
      CreateEditUserComponentModalEnum.TITLE
    );
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.userForm.controls;
  }

  ngOnInit() {
    this.userToEdit = this.extendedComponentData;
    if (this.userToEdit) {
      this.MODAL_TITLE = marker('user.edit');
    }
    this.getUsersPermissions();
    this.initializeForm();
    this.getListOptions();
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.userForm.touched && this.userForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | UserDetailsDTO> {
    const formValue = this.userForm.value;
    //Role permissions + User permissions
    formValue.permissions = [
      ...this.permissionsListComponent.getPermissionsChecked(),
      ...this.userPermissions.filter((pObj) => pObj.checked).map((pObj) => pObj.permission)
    ];
    formValue.password = formValue.newPassword;
    if (this.userToEdit) {
      formValue.id = this.userToEdit.id;
    }
    const spinner = this.spinnerService.show();
    return this.userService.addUser(formValue).pipe(
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
          type: 'custom',
          label: marker('user.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteUser,
          hiddenFn: () => !this.userToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.validChangesInForm()
        }
      ]
    };
  }

  public validChangesInForm = (): boolean =>
    ((this.userForm.touched && this.userForm.dirty) || this.changesInPermissions()) && this.userForm.valid;

  public checkPermission = (permissionObj: { permission: PermissionsDTO; checked: boolean }, event: MatCheckboxChange): void => {
    permissionObj.checked = event.checked;
  };

  public getPermissionsSelectedByDefault = (): PermissionsDTO[] | null =>
    this.userToEdit?.permissions ? this.userToEdit.permissions : null;

  private getListOptions(): void {
    this.rolesAsyncList = this.roleService.getAllRoles().pipe(
      tap({
        next: (roles: RoleDTO[]) => {
          if (this.userToEdit) {
            this.userForm.get('role').setValue(roles.find((role: RoleDTO) => role.id === this.userToEdit.role.id));
          }
        }
      })
    );
  }

  private deleteUser = () => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('user.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.userService
            .deleteUser(this.userToEdit)
            .pipe(take(1))
            .subscribe({
              next: (response) => {
                this.customDialogService.close(this.MODAL_ID, true);
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  private initializeForm(): void {
    this.userForm = this.fb.group(
      {
        name: [this.userToEdit ? this.userToEdit.name : null, Validators.required],
        firstName: [this.userToEdit ? this.userToEdit.firstName : null],
        lastName: [this.userToEdit ? this.userToEdit.lastName : null],
        email: [this.userToEdit ? this.userToEdit.email : null, [Validators.email]],
        code: [this.userToEdit ? this.userToEdit.code : null],
        userId: [this.userToEdit ? this.userToEdit.userId : null],
        userName: [this.userToEdit ? this.userToEdit.userName : null, Validators.required],
        role: [this.userToEdit ? this.userToEdit.role : null, Validators.required],
        newPassword: [
          this.userToEdit ? this.userToEdit.password : null,
          [
            Validators.required,
            ConfirmPasswordValidator.validAndDiffToOriginal('newPassword', this.userToEdit ? this.userToEdit.password : null)
          ]
        ],
        newPasswordConfirmation: [this.userToEdit ? this.userToEdit.password : null, Validators.required],
        brands: [this.userToEdit ? this.userToEdit.brands : null, Validators.required],
        facilities: [this.userToEdit ? this.userToEdit.facilities : null, Validators.required],
        departments: [this.userToEdit ? this.userToEdit.departments : null, Validators.required],
        specialties: [this.userToEdit ? this.userToEdit.specialties : null, Validators.required]
      },
      {
        validators: ConfirmPasswordValidator.mustMatch('newPassword', 'newPasswordConfirmation')
      }
    );
  }

  private getUsersPermissions(): void {
    this.permissionsService
      .getAllPermissions()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.userPermissions = response
            .filter((r) => r.type === this.permissionsService.PERMISSIONS_CODES_FOR_USERS)
            .map((p: PermissionsDTO) => ({
              permission: p,
              checked:
                this.userToEdit?.permissions && this.userToEdit.permissions.find((up: PermissionsDTO) => up.id === p.id)
                  ? true
                  : false
            }));
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  private changesInPermissions(): boolean {
    return !haveArraysSameValues(
      this.userToEdit ? this.userToEdit.permissions.map((p) => p.id).sort() : [],
      [
        ...this.permissionsListComponent.getPermissionsChecked().map((p) => p.id),
        ...this.userPermissions
          .filter((pObj) => pObj.checked)
          .map((pObj) => pObj.permission)
          .map((p) => p.id)
      ].sort()
    );
  }
}
