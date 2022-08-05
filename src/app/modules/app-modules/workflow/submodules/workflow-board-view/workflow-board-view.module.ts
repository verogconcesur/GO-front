import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowBoardViewRoutingModule } from './workflow-board-view-routing.module';
import { SharedModule } from '@shared/shared.module';
import { WokflowBoardColumnComponent } from './subcomponents/wokflow-board-column/wokflow-board-column.component';
import { WorkflowBoardViewComponent } from './workflow-board-view.component';

@NgModule({
  declarations: [WokflowBoardColumnComponent, WorkflowBoardViewComponent],
  imports: [CommonModule, SharedModule, WorkflowBoardViewRoutingModule]
})
export class WorkflowBoardViewModule {}
