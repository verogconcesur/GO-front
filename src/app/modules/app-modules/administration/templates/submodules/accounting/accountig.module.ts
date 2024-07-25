import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountingsRoutingModule } from './accounting-routing.module';
import { AccountingsComponent } from './accounting.component';
import { SharedModule } from '@shared/shared.module';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { CreateEditAccountingComponent } from './dialog/create-edit-accounting/create-edit-accounting.component';
import { CreateEditLineComponent } from './dialog/create-edit-line/create-edit-line.component';
import { CreateEditBlockComponent } from './dialog/create-edit-block/create-edit-block.component';

@NgModule({
  declarations: [AccountingsComponent, CreateEditAccountingComponent, CreateEditLineComponent, CreateEditBlockComponent],
  imports: [CommonModule, SharedModule, AccountingsRoutingModule, OrganizationLevelsNestedCombosModule]
})
export class AccountingsModule {}
