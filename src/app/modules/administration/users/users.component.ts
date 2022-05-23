import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { RolesListComponent } from './components/roles-list/roles-list.component';
import { UsersListComponent } from './components/users-list/users-list.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @ViewChild('usersList') usersListComponent: UsersListComponent;
  @ViewChild('rolesList') rolesListComponent: RolesListComponent;
  public selectedTab: 'users' | 'roles' = 'users';

  public labels = {
    users: marker('users.title'),
    roles: marker('roles.title'),
    createUser: marker('users.create'),
    createRole: marker('roles.create')
  };

  constructor() {}

  ngOnInit(): void {}

  public buttonCreateAction(): void {
    if (this.selectedTab === 'users') {
      // TODO: DGDC descomentar cuando mergeemos
      //this.usersListComponent.openCreateUserDialog();
    } else {
      // TODO: DGDC link with create role action
      // this.rolesListComponent.openCreateRoleDialog();
    }
  }

  public changeSelectedTab(tab: MatTabChangeEvent): void {
    if (tab.index === 0) {
      this.selectedTab = 'users';
    } else {
      this.selectedTab = 'roles';
    }
  }
}
