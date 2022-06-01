import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDetailsDTO from '@data/models/user-details-dto';
import { Observable } from 'rxjs';
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
      this.usersListComponent.openCreateUserDialog();
    } else {
      this.rolesListComponent.openCreateRoleDialog();
    }
  }

  public getFilteredData = (
    text: string
  ): Observable<{ content: UserDetailsDTO[]; optionLabelFn: (option: UserDetailsDTO) => string }> => {
    if (this.selectedTab === 'users') {
      return this.usersListComponent.getFilteredData(text);
    } else {
      //TODO: DGDC link with filter role action
    }
  };

  public buttonShowFilterDrawerAction(): void {
    if (this.selectedTab === 'users') {
      this.usersListComponent.openFilterUserDialog();
    } else {
      //TODO: DGDC link with filter role action
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public buttonSearchAction(option: any): void {
    if (this.selectedTab === 'users') {
      return this.usersListComponent.showFilterOptionSelected(option);
    } else {
      //TODO: DGDC link with filter role action
    }
  }

  public changeSelectedTab(tab: MatTabChangeEvent): void {
    if (tab.index === 0) {
      this.selectedTab = 'users';
    } else {
      this.selectedTab = 'roles';
    }
  }

  public areFiltersSettedAndActive(): boolean {
    if (this.selectedTab === 'users') {
      return this.usersListComponent?.areFiltersSettedAndActive();
    }
    return false;
  }
}
