import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowRoutingModule } from './workflow-routing.module';
import { WorkflowComponent } from './workflow.component';
import { SharedModule } from '@shared/shared.module';
import { WorkflowNavbarComponent } from './components/workflow-navbar/workflow-navbar.component';
import { WorkflowCalendarViewComponent } from './submodules/workflow-calendar-view/workflow-calendar-view.component';
import { WorkflowTableViewComponent } from './submodules/workflow-table-view/workflow-table-view.component';
import { WorkflowNavbarFilterComponent } from './components/workflow-navbar-filter/workflow-navbar-filter.component';
// eslint-disable-next-line max-len
import { WorkflowNavbarFilterFormComponent } from './components/workflow-navbar-filter-form/workflow-navbar-filter-form.component';
import { WorkflowDragAndDropService } from './aux-service/workflow-drag-and-drop.service';
import { WorkflowFilterService } from './aux-service/workflow-filter.service';
import { WorkflowsService } from '@data/services/workflows.service';

@NgModule({
  declarations: [
    WorkflowComponent,
    WorkflowNavbarComponent,
    WorkflowCalendarViewComponent,
    WorkflowTableViewComponent,
    WorkflowNavbarFilterComponent,
    WorkflowNavbarFilterFormComponent
  ],
  imports: [CommonModule, SharedModule, WorkflowRoutingModule]
})
export class WorkflowModule {}
