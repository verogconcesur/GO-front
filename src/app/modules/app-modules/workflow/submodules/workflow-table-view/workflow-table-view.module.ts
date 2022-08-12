import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowTableViewRoutingModule } from './workflow-table-view-routing.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, WorkflowTableViewRoutingModule]
})
export class WorkflowTableViewModule {}
