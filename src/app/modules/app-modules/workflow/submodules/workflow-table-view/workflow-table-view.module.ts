import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowTableViewRoutingModule } from './workflow-table-view-routing.module';
import { SharedModule } from '@shared/shared.module';
import { WorkflowTableViewComponent } from './workflow-table-view.component';
import { WorkflowTableStateComponent } from './subcomponents/workflow-table-state/workflow-table-state.component';
import { WorkflowTableSubstateComponent } from './subcomponents/workflow-table-substate/workflow-table-substate.component';
import { WorkflowCardTasksModule } from '@modules/feature-modules/workflow-card-tasks/workflow-card-tasks.module';

@NgModule({
  declarations: [WorkflowTableViewComponent, WorkflowTableStateComponent, WorkflowTableSubstateComponent],
  imports: [CommonModule, SharedModule, WorkflowTableViewRoutingModule, WorkflowCardTasksModule]
})
export class WorkflowTableViewModule {}
