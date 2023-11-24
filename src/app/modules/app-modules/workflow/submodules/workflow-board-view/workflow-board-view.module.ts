import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowBoardViewRoutingModule } from './workflow-board-view-routing.module';
import { SharedModule } from '@shared/shared.module';
import { WokflowBoardColumnComponent } from './subcomponents/wokflow-board-column/wokflow-board-column.component';
import { WorkflowBoardViewComponent } from './workflow-board-view.component';
import { WorkflowCardTasksModule } from '@modules/feature-modules/workflow-card-tasks/workflow-card-tasks.module';
import { WorkflowCardModule } from '@modules/feature-modules/workflow-card/workflow-card.module';

@NgModule({
  declarations: [WokflowBoardColumnComponent, WorkflowBoardViewComponent],
  imports: [CommonModule, SharedModule, WorkflowBoardViewRoutingModule, WorkflowCardTasksModule, WorkflowCardModule]
})
export class WorkflowBoardViewModule {}
