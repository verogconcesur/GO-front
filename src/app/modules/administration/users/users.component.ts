import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public selectedTab: 'users' | 'roles' = 'users';

  public labels = {
    users: marker('users.title'),
    roles: marker('roles.title'),
    createUser: marker('users.create'),
    createRole: marker('roles.create')
  };

  constructor() {}

  ngOnInit(): void {}

  public changeSelectedTab(tab: MatTabChangeEvent): void {
    if (tab.index === 0) {
      this.selectedTab = 'users';
    } else {
      this.selectedTab = 'roles';
    }
  }
}
