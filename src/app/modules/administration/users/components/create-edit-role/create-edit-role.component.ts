import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PermissionsDTO from '@data/models/permissions-dto';
import { PermissionsService } from '@data/services/permissions.service';
import { RoleService } from '@data/services/role.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
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
    selectAll: marker('users.roles.selectAll')
  };
  public permissions: PermissionsDTO[] = [];
  public roleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private roleService: RoleService,
    private spinnerService: ProgressSpinnerDialogService,
    private permissionsService: PermissionsService,
    private globalMessageService: GlobalMessageService
  ) {
    super(
      CreateEditRoleComponentModalEnum.ID,
      CreateEditRoleComponentModalEnum.PANEL_CLASS,
      marker(CreateEditRoleComponentModalEnum.TITLE)
    );
  }

  ngOnInit(): void {
    this.initalizeFormGroup();
    this.getAllPermissions();
  }

  public initalizeFormGroup(): void {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      permissions: [[]]
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
    const spinner = this.spinnerService.show();
    return this.roleService.addRole(formValue).pipe(
      map((response) => {
        this.globalMessageService.showSuccess({
          message: this.translateService.instant(marker('common.successOperation')),
          actionText: 'Close'
        });
        return response;
      }),
      catchError((error) => {
        const err = error.error as ConcenetError;
        this.globalMessageService.showError({
          message: err.message,
          actionText: 'Close'
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
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.roleForm?.touched && this.roleForm?.dirty && this.roleForm?.valid)
        }
      ]
    };
  }

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
            actionText: 'Close'
          });
        }
      });
  }
}
