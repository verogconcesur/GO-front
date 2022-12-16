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
// eslint-disable-next-line max-len
import { WorkflowCardMovementPreparationComponent } from './components/workflow-card-movement-preparation/workflow-card-movement-preparation.component';
import { TextEditorWrapperModule } from '@modules/feature-modules/text-editor-wrapper/text-editor-wrapper.module';
// eslint-disable-next-line max-len
import { MatChipsInputFormFieldModule } from '@modules/feature-modules/mat-chips-input-form-field/mat-chips-input-form-field.module';

@NgModule({
  declarations: [
    WorkflowComponent,
    WorkflowNavbarComponent,
    WorkflowCalendarViewComponent,
    WorkflowTableViewComponent,
    WorkflowNavbarFilterComponent,
    WorkflowNavbarFilterFormComponent,
    WorkflowCardMovementPreparationComponent
  ],
  imports: [CommonModule, SharedModule, WorkflowRoutingModule, TextEditorWrapperModule, MatChipsInputFormFieldModule]
})
export class WorkflowModule {}
