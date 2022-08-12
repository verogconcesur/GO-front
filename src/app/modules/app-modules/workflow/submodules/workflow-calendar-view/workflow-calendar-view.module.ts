import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowCalendarViewRoutingModule } from './workflow-calendar-view-routing.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, WorkflowCalendarViewRoutingModule]
})
export class WorkflowCalendarViewModule {}
