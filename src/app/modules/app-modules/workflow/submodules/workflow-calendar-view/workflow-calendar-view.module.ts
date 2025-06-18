import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { WorkflowCardTasksModule } from '@modules/feature-modules/workflow-card-tasks/workflow-card-tasks.module';
import { WorkflowCardModule } from '@modules/feature-modules/workflow-card/workflow-card.module';
import { SharedModule } from '@shared/shared.module';
import { WorkflowCalendarViewRoutingModule } from './workflow-calendar-view-routing.module';
// eslint-disable-next-line max-len
import { ModalAssociatedCardsModule } from '@modules/feature-modules/modal-associated-cards/modal-associated-cards.module';
// eslint-disable-next-line max-len
import { WorkflowCalendarHourLineComponent } from './subcomponents/workflow-calendar-hour-line/workflow-calendar-hour-line.component';
import { WorkflowCalendarViewComponent } from './workflow-calendar-view.component';

@NgModule({
  declarations: [WorkflowCalendarViewComponent, WorkflowCalendarHourLineComponent],
  imports: [
    CommonModule,
    SharedModule,
    WorkflowCalendarViewRoutingModule,
    WorkflowCardTasksModule,
    WorkflowCardModule,
    ModalAssociatedCardsModule
  ]
})
export class WorkflowCalendarViewModule {}
