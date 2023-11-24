import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChecklistsRoutingModule } from './checklists-routing.module';
import { ChecklistsComponent } from './checklists.component';
import { SharedModule } from '@shared/shared.module';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';

@NgModule({
  declarations: [ChecklistsComponent],
  imports: [CommonModule, SharedModule, ChecklistsRoutingModule, OrganizationLevelsNestedCombosModule]
})
export class ChecklistsModule {}
