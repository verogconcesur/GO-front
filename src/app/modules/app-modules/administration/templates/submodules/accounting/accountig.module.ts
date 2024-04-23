import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountingsRoutingModule } from './accounting-routing.module';
import { AccountingsComponent } from './accounting.component';
import { SharedModule } from '@shared/shared.module';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { CreateEditAccountingComponent } from './dialog/create-edit-accounting/create-edit-accounting.component';

@NgModule({
  declarations: [AccountingsComponent, CreateEditAccountingComponent],
  imports: [CommonModule, SharedModule, AccountingsRoutingModule, OrganizationLevelsNestedCombosModule]
})
export class AccountingsModule {}
