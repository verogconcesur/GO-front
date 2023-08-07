import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowCalendarViewRoutingModule } from './workflow-calendar-view-routing.module';
import { SharedModule } from '@shared/shared.module';
import { WorkflowCardTasksModule } from '@modules/feature-modules/workflow-card-tasks/workflow-card-tasks.module';
import { WorkflowCardModule } from '@modules/feature-modules/workflow-card/workflow-card.module';
// eslint-disable-next-line max-len
import { WorkflowCalendarHourLineComponent } from './subcomponents/workflow-calendar-hour-line/workflow-calendar-hour-line.component';
import { WorkflowCalendarViewComponent } from './workflow-calendar-view.component';

@NgModule({
  declarations: [WorkflowCalendarViewComponent, WorkflowCalendarHourLineComponent],
  imports: [CommonModule, SharedModule, WorkflowCalendarViewRoutingModule, WorkflowCardTasksModule, WorkflowCardModule]
})
export class WorkflowCalendarViewModule {}
