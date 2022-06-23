import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PermissionsDTO from '@data/models/permissions-dto';
import RoleDTO from '@data/models/role-dto';
import { PermissionsService } from '@data/services/permissions.service';
import { RoleService } from '@data/services/role.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI, ComponentToExtendForCustomDialog, CustomDialogService } from '@jenga/custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { UsersPermissionsComponent } from '../users-permissions/users-permissions.component';

export const enum CreateEditRoleComponentModalEnum {
  ID = 'create-edit-role-dialog-id',
  PANEL_CLASS = 'create-edit-role-dialog',
  TITLE = 'users.roles.create'
}

@Component({
  selector: 'app-create-edit-role',
  templateUrl: './create-edit-role.component.html',
  styleUrls: ['./create-edit-role.component.scss']
})
export class CreateEditRoleComponent extends ComponentToExtendForCustomDialog implements OnInit {
  @ViewChild('permissionsListComponent') permissionsListComponent: UsersPermissionsComponent;
  public labels = {
    title: marker('users.roles.create'),
    roleName: marker('users.roles.roleName'),
    roleNameRequired: marker('users.roles.roleNameRequired'),
    selectAll: marker('users.roles.selectAll'),
    maxLengthError: marker('errors.maxLengthError')
  };
  public permissions: PermissionsDTO[] = [];
  public roleForm: FormGroup;
  public roleToEdit: RoleDTO = null;

  constructor(
    private fb: FormBuilder,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private roleService: RoleService,
    private spinnerService: ProgressSpinnerDialogService,
    private permissionsService: PermissionsService,
    private globalMessageService: GlobalMessageService,
    private confirmationDialog: ConfirmDialogService,
    private customDialogService: CustomDialogService
  ) {
    super(
      CreateEditRoleComponentModalEnum.ID,
      CreateEditRoleComponentModalEnum.PANEL_CLASS,
      marker(CreateEditRoleComponentModalEnum.TITLE)
    );
  }

  ngOnInit(): void {
    this.roleToEdit = this.extendedComponentData;
    if (this.roleToEdit) {
      this.MODAL_TITLE = marker('users.roles.edit');
    }
    this.getAllPermissions();
    this.initalizeFormGroup();
  }

  public initalizeFormGroup(): void {
    this.roleForm = this.fb.group({
      name: [this.roleToEdit ? this.roleToEdit.name : '', [Validators.required, Validators.maxLength(30)]],
      permissions: [this.roleToEdit ? this.roleToEdit.permissions : []]
    });
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.roleForm.touched && this.roleForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onSubmitCustomDialog(): Observable<any> {
    const formValue = this.roleForm.value;
    formValue.permissions = this.permissionsListComponent.getPermissionsChecked();
    if (this.roleToEdit) {
      formValue.id = this.roleToEdit.id;
    }
    const spinner = this.spinnerService.show();
    return this.roleService.addOrEditRole(formValue).pipe(
      map((response) => {
        this.roleService.rolesChange$.next(true);
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
          label: marker('users.roles.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteRole,
          hiddenFn: () => !this.roleToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () =>
            !(
              ((this.roleForm?.touched && this.roleForm?.dirty) ||
                this.permissionsListComponent.hasChangesRespectDefaultCheckedPermissions()) &&
              (this.permissionsListComponent.someSelected() || this.permissionsListComponent.allSelected) &&
              this.roleForm?.valid
            )
        }
      ]
    };
  }

  public getPermissionsSelectedByDefault = (): PermissionsDTO[] | null =>
    this.roleToEdit?.permissions ? this.roleToEdit.permissions : null;

  private deleteRole = () => {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('users.roles.deleteConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          this.roleService
            .deleteRoleById(this.roleToEdit.id)
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

  private getAllPermissions(): void {
    this.permissionsService
      .getAllPermissions()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.permissions = response.filter((r) => r.type === this.permissionsService.PERMISSIONS_CODES_FOR_ROLES);
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
}
