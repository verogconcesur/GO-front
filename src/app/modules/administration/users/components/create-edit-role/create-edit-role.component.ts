import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PermissionsDTO from '@data/models/permissions-dto';
import { PermissionsService } from '@data/services/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';

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
  public labels = {
    title: marker('users.roles.create'),
    roleName: marker('users.roles.roleName'),
    roleNameRequired: marker('users.roles.roleNameRequired'),
    selectAll: marker('users.roles.selectAll')
  };

  public readonly ALLOWED_PERMISSIONS = 1;

  public roleForm: FormGroup;
  public permissionsList: PermissionsDTO[];

  constructor(
    private fb: FormBuilder,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private permissionsService: PermissionsService,
    private spinnerService: ProgressSpinnerDialogService,
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
      roleName: ['', Validators.required],
      permissions: ['']
    });
  }

  public getAllPermissions(): void {
    this.permissionsService.getAllPermissions().subscribe({
      next: (response) => {
        this.permissionsList = response.filter((r) => r.type === this.ALLOWED_PERMISSIONS);
      },
      error: (error: ConcenetError) => {
        this.globalMessageService.showError({
          message: error.message,
          actionText: 'Close'
        });
      }
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
    throw new Error('Method not implemented.');
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
}
