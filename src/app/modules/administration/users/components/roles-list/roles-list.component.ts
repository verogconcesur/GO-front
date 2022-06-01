import { Component, OnInit } from '@angular/core';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import RoleDTO from '@data/models/role-dto';
import { RoleService } from '@data/services/role.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import { CreateEditRoleComponent, CreateEditRoleComponentModalEnum } from '../create-edit-role/create-edit-role.component';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})
export class RolesListComponent implements OnInit {
  public roles: RoleDTO[];

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
    this.getAllAvailableRoles();
  }

  public getAllAvailableRoles(): void {
    const spinner = this.spinnerService.show();

    this.roleService
      .getAllRoles()
      .pipe(
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe({
        next: (response: RoleDTO[]) => {
          this.roles = response;
        },
        error: (error: ConcenetError) => {
          this.logger.error(error);

          this.globalMessageService.showError({
            message: error.message,
            actionText: 'Close'
          });
        }
      });
  }

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
              finalize(() => {
                this.spinnerService.hide(spinner);
              })
            )
            .subscribe({
              next: (response) => {
                this.roles = this.roles.filter((role) => role.id !== roleId);
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: 'Close'
                });
              },
              error: (error) => {
                this.logger.error(error.message);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: 'Close'
                });
              }
            });
        }
      });
  }

  public openCreateRoleDialog(): void {
    this.customDialogService
      .open({
        component: CreateEditRoleComponent,
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
