import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateEditAccountingComponent } from './create-edit-accounting.component';
import { SharedModule } from '@shared/shared.module';
import { CreateEditAccountingsRoutingModule } from './create-edit-accounting-routing.module';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';

@NgModule({
  declarations: [CreateEditAccountingComponent],
  imports: [CommonModule, SharedModule, CreateEditAccountingsRoutingModule, OrganizationLevelsNestedCombosModule]
})
export class CreateEditAccountingModule {}
