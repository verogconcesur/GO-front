import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowCardDetailsRoutingModule } from './workflow-card-details-routing.module';
import { WorkflowCardDetailsComponent } from './workflow-card-details.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [WorkflowCardDetailsComponent],
  imports: [CommonModule, SharedModule, WorkflowCardDetailsRoutingModule]
})
export class WorkflowCardDetailsModule {}
