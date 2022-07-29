import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientTimelineRoutingModule } from './client-timeline-routing.module';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { SharedModule } from '@shared/shared.module';
import { ClientTimelineComponent } from './client-timeline.component';
import { CreateEditTimelineComponent } from './dialog/create-edit-timeline/create-edit-timeline.component';

@NgModule({
  declarations: [ClientTimelineComponent, CreateEditTimelineComponent],
  imports: [CommonModule, SharedModule, ClientTimelineRoutingModule, OrganizationLevelsNestedCombosModule]
})
export class ClientTimelineModule {}
