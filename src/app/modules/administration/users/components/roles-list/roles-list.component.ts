import { Component, OnInit } from '@angular/core';
import { ConcenetError } from '@app/types/error';
import RoleDTO from '@data/models/role-dto';
import { RoleService } from '@data/services/role.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize } from 'rxjs/operators';

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
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger
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
    const spinner = this.spinnerService.show();

    this.roleService
      .deleteRoleById(roleId)
      .pipe(
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe({
        next: (response) => {},
        error: (error) => {
          this.logger.error(error.error.message);

          this.globalMessageService.showError({
            message: error.error.message,
            actionText: 'Close'
          });
        }
      });
  }
}
