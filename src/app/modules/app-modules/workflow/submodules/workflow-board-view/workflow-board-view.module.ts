import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowBoardViewRoutingModule } from './workflow-board-view-routing.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, WorkflowBoardViewRoutingModule]
})
export class WorkflowBoardViewModule {}
