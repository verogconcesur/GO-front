import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PermissionsDTO from '@data/models/permissions-dto';
import RoleDTO from '@data/models/role-dto';
import { PermissionsService } from '@data/services/permissions.service';
import { GlobalMessageService } from '@shared/services/global-message.service';

export interface PermisssionsStructure {
  id?: number;
  description?: string;
  completed: boolean;
  permissions?: PermisssionsStructure[];
}

@Component({
  selector: 'app-users-permissions',
  templateUrl: './users-permissions.component.html',
  styleUrls: ['./users-permissions.component.scss']
})
export class UsersPermissionsComponent implements OnInit, OnChanges {
  @Input() overFlowLayerLabel = '';
  @Input() showOverFlowLayer = false;
  @Input() permissions: PermissionsDTO[];
  @Input() type: 'CREATE_EDIT_ROLE' | 'CREATE_EDIT_USER' = 'CREATE_EDIT_USER';

  public labels = {
    selectAll: marker('users.roles.selectAll')
  };
  public permissionsStructure: PermisssionsStructure;
  public allSelected = false;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.permissions?.currentValue && this.permissions) {
      this.manageDataStructre();
    }
  }

  public resetRolesPermissions(): void {
    this.manageDataStructre();
  }

  public manageDataStructre(): void {
    const rolesDefaultPermissions =
      this.permissions && this.type === 'CREATE_EDIT_USER'
        ? this.permissions.map((permission: PermissionsDTO) => permission.id)
        : [];
    this.permissionsStructure = {
      completed: this.type === 'CREATE_EDIT_USER' ? true : false,
      permissions: this.permissions.map((p) => ({
        id: p.id,
        description: p.description,
        completed: rolesDefaultPermissions.indexOf(p.id) >= 0
      }))
    };
    this.updateAllComplete();
  }

  // Checkbox management
  updateAllComplete() {
    this.allSelected =
      this.permissionsStructure?.permissions != null && this.permissionsStructure.permissions.every((p) => p.completed);
  }

  public someSelected(): boolean {
    if (this.permissionsStructure?.permissions == null) {
      return false;
    }
    return this.permissionsStructure?.permissions.filter((p) => p.completed).length > 0 && !this.allSelected;
  }

  public setAll(completed: boolean) {
    this.allSelected = completed;

    if (this.permissionsStructure?.permissions == null) {
      return;
    }
    this.permissionsStructure?.permissions.forEach((p) => (p.completed = completed));
  }

  public getPermissionsChecked(): PermissionsDTO[] {
    const permissionsChecked = this.permissionsStructure.permissions.filter((p) => p.completed).map((p) => p.id);
    return this.permissions.filter((permission: PermissionsDTO) => permissionsChecked.indexOf(permission.id) >= 0);
  }

  public hasChangesRespectRolePermissions(): boolean {
    const array1 = this.getPermissionsChecked()?.map((p: PermissionsDTO) => p.id);
    const array2 = this.permissions?.map((p: PermissionsDTO) => p.id);
    return !(array1 && array2 && array1.length === array2.length && array1.every((value, index) => value === array2[index]));
  }
}
