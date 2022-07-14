/* eslint-disable max-len */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CreateEditRoleComponent } from './components/create-edit-role/create-edit-role.component';
import { RolesListComponent } from './components/roles-list/roles-list.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UsersPermissionsComponent } from './components/users-permissions/users-permissions.component';
import { UsersRoutingModule } from './users-routing.module';
import { UsersFilterComponent } from './components/users-filter/users-filter.component';
import { UsersComponent } from './users.component';
import { CreateEditUserComponent } from './components/create-edit-user/create-edit-user.component';
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';

@NgModule({
  declarations: [
    UsersComponent,
    UsersListComponent,
    RolesListComponent,
    CreateEditRoleComponent,
    UsersPermissionsComponent,
    UsersFilterComponent,
    CreateEditUserComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    FilterDrawerModule,
    AdministrationCommonHeaderSectionModule,
    OrganizationLevelsNestedCombosModule
  ]
})
export class UsersModule {}
