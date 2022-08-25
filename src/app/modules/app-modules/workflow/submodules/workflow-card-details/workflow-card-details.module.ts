/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowCardDetailsRoutingModule } from './workflow-card-details-routing.module';
import { WorkflowCardDetailsComponent } from './workflow-card-details.component';
import { SharedModule } from '@shared/shared.module';
import { WorkflowCardColumnComponent } from './subcomponents/workflow-card-column/workflow-card-column.component';
import { WorkflowColumnCustomizableEntityComponent } from './subcomponents/workflow-column-customizable-entity/workflow-column-customizable-entity.component';

@NgModule({
  declarations: [WorkflowCardDetailsComponent, WorkflowCardColumnComponent, WorkflowColumnCustomizableEntityComponent],
  imports: [CommonModule, SharedModule, WorkflowCardDetailsRoutingModule]
})
export class WorkflowCardDetailsModule {}
