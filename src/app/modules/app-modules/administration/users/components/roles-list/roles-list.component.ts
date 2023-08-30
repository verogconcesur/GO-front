import { Component, OnInit } from '@angular/core';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import RoleDTO from '@data/models/user-permissions/role-dto';
import { RoleService } from '@data/services/role.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@frontend/custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { normalizaStringToLowerCase } from '@shared/utils/string-normalization-lower-case';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import { CreateEditRoleComponent, CreateEditRoleComponentModalEnum } from '../create-edit-role/create-edit-role.component';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})
export class RolesListComponent implements OnInit {
  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };
  public roles: RoleDTO[];
  private originalRoles: RoleDTO[];

  constructor(
    private roleService: RoleService,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private logger: NGXLogger,
    private customDialogService: CustomDialogService
  ) {}

  ngOnInit(): void {
    this.getAllAvailableRoles(false);
  }

  public getAllAvailableRoles(showSpinner = true): void {
    const spinner = showSpinner ? this.spinnerService.show() : null;

    this.roleService
      .getAllRoles()
      .pipe(
        take(1),
        finalize(() => {
          if (spinner) {
            this.spinnerService.hide(spinner);
          }
        })
      )
      .subscribe({
        next: (response: RoleDTO[]) => {
          this.roles = response;
          this.originalRoles = [...this.roles];
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

  public filterRoles = (roleName: string): void => {
    roleName = roleName ? roleName : '';
    this.roles = [
      ...this.originalRoles.filter(
        (role: RoleDTO) => normalizaStringToLowerCase(role.name).indexOf(normalizaStringToLowerCase(roleName)) >= 0
      )
    ];
  };

  public deleteRole(roleId: number): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('roles.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.roleService
            .deleteRoleById(roleId)
            .pipe(
              take(1),
              finalize(() => {
                this.spinnerService.hide(spinner);
              })
            )
            .subscribe({
              next: (response) => {
                this.roles = this.roles.filter((role) => role.id !== roleId);
                this.originalRoles = this.originalRoles.filter((role) => role.id !== roleId);
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              },
              error: (error) => {
                this.logger.error(error.message);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }

  public openCreateRoleDialog(roleToEdit?: RoleDTO): void {
    this.customDialogService
      .open({
        component: CreateEditRoleComponent,
        extendedComponentData: roleToEdit ? roleToEdit : null,
        id: CreateEditRoleComponentModalEnum.ID,
        panelClass: CreateEditRoleComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '922px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.getAllAvailableRoles();
        }
      });
  }
}
