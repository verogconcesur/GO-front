import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDetailsDTO from '@data/models/user-details-dto';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionComponent } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.component';
import { Observable, of } from 'rxjs';
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
  @ViewChild('usersHeader') usersHeader: AdministrationCommonHeaderSectionComponent;
  public selectedTab: 'users' | 'roles' = 'users';

  public labels = {
    users: marker('users.title'),
    roles: marker('roles.title'),
    createUser: marker('users.create'),
    createRole: marker('roles.create')
  };

  private lastFilterSearch: string;

  constructor() {}

  ngOnInit(): void {}

  public buttonCreateAction(): void {
    if (this.selectedTab === 'users') {
      this.usersListComponent.openCreateEditUserDialog();
    } else {
      this.rolesListComponent.openCreateRoleDialog();
    }
  }

  public getFilteredData = (
    text: string
  ): Observable<{ content: UserDetailsDTO[]; optionLabelFn: (option: UserDetailsDTO) => string } | null> => {
    if (this.selectedTab === 'users') {
      return this.usersListComponent.getFilteredData(text);
    } else {
      // For roles we don't do the filter inside the input, we do it over the roles directly
      return of(null);
    }
  };

  public buttonShowFilterDrawerAction(): void {
    if (this.selectedTab === 'users') {
      this.usersListComponent.openFilterUserDialog();
    } else {
      //Nothing to do, no filter drawer for roles
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public buttonSearchAction(option: any): void {
    this.lastFilterSearch = option;
    if (this.selectedTab === 'users') {
      return this.usersListComponent.showFilterOptionSelected(option);
    } else {
      return this.rolesListComponent.filterRoles(option);
    }
  }

  public changeSelectedTab(tab: MatTabChangeEvent): void {
    this.usersHeader?.resetFilter();
    if (this.lastFilterSearch) {
      this.buttonSearchAction(null);
    }
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
