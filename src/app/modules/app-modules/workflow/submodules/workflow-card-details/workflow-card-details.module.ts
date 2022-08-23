import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowCardDetailsRoutingModule } from './workflow-card-details-routing.module';
import { WorkflowCardDetailsComponent } from './workflow-card-details.component';
import { SharedModule } from '@shared/shared.module';
import { WorkflowCardColumnComponent } from './subcomponents/workflow-card-column/workflow-card-column.component';

@NgModule({
  declarations: [WorkflowCardDetailsComponent, WorkflowCardColumnComponent],
  imports: [CommonModule, SharedModule, WorkflowCardDetailsRoutingModule]
})
export class WorkflowCardDetailsModule {}
