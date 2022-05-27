import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PermissionsDTO from '@data/models/permissions-dto';

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
export class UsersPermissionsComponent implements OnInit, AfterViewInit {
  @Input() permissions: PermissionsDTO[];

  public labels = {
    selectAll: marker('users.roles.selectAll')
  };

  public permissionsStructure: PermisssionsStructure;
  public allSelected = false;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // TODO: JF Check this.permissions in onChange cycle hook
    setTimeout(() => {
      this.manageDataStructre();
    }, 1000);
  }

  public manageDataStructre(): void {
    this.permissionsStructure = {
      completed: false,
      permissions: this.permissions.map((p) => ({ id: p.id, description: p.description, completed: false }))
    };
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
}
