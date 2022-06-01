import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CreateEditRoleComponent } from './components/create-edit-role/create-edit-role.component';
import { RolesListComponent } from './components/roles-list/roles-list.component';
import { UsersHeaderComponent } from './components/users-header/users-header.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UsersPermissionsComponent } from './components/users-permissions/users-permissions.component';
import { UsersRoutingModule } from './users-routing.module';
import { UsersFilterComponent } from './components/users-filter/users-filter.component';
import { UsersComponent } from './users.component';
import { CreateEditUserComponent } from './components/create-edit-user/create-edit-user.component';

@NgModule({
  declarations: [
    UsersComponent,
    UsersHeaderComponent,
    UsersListComponent,
    RolesListComponent,
    CreateEditRoleComponent,
    UsersPermissionsComponent,
    UsersFilterComponent,
    CreateEditUserComponent
  ],
  imports: [CommonModule, UsersRoutingModule, SharedModule]
})
export class UsersModule {}
