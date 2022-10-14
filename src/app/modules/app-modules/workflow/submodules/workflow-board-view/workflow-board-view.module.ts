import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowBoardViewRoutingModule } from './workflow-board-view-routing.module';
import { SharedModule } from '@shared/shared.module';
import { WokflowBoardColumnComponent } from './subcomponents/wokflow-board-column/wokflow-board-column.component';
import { WorkflowBoardViewComponent } from './workflow-board-view.component';
import { WorkflowCardComponent } from './subcomponents/workflow-card/workflow-card.component';
import { WorkflowCardTasksModule } from '@modules/feature-modules/workflow-card-tasks/workflow-card-tasks.module';

@NgModule({
  declarations: [WokflowBoardColumnComponent, WorkflowBoardViewComponent, WorkflowCardComponent],
  imports: [CommonModule, SharedModule, WorkflowBoardViewRoutingModule, WorkflowCardTasksModule]
})
export class WorkflowBoardViewModule {}
