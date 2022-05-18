import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { SharedModule } from '@shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UsersHeaderComponent } from './components/users-header/users-header.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { RolesListComponent } from './components/roles-list/roles-list.component';

@NgModule({
  declarations: [UsersComponent, UsersHeaderComponent, UsersListComponent, RolesListComponent],
  imports: [CommonModule, UsersRoutingModule, SharedModule]
})
export class UsersModule {}
