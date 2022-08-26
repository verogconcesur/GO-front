/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowCardDetailsRoutingModule } from './workflow-card-details-routing.module';
import { WorkflowCardDetailsComponent } from './workflow-card-details.component';
import { SharedModule } from '@shared/shared.module';
import { WorkflowCardColumnComponent } from './subcomponents/workflow-card-column/workflow-card-column.component';
import { WorkflowColumnCustomizableEntityComponent } from './subcomponents/workflow-column-customizable-entity/workflow-column-customizable-entity.component';
import { WorkflowColumnCustomizableCustomComponent } from './subcomponents/workflow-column-customizable-custom/workflow-column-customizable-custom.component';
import { WorkflowColumnTemplatesBudgetsComponent } from './subcomponents/workflow-column-templates-budgets/workflow-column-templates-budgets.component';
import { WorkflowColumnTemplatesAttachmentsComponent } from './subcomponents/workflow-column-templates-attachments/workflow-column-templates-attachments.component';
import { WorkflowColumnPrefixedInformationComponent } from './subcomponents/workflow-column-prefixed-information/workflow-column-prefixed-information.component';
import { WorkflowColumnPrefixedTasksComponent } from './subcomponents/workflow-column-prefixed-tasks/workflow-column-prefixed-tasks.component';
import { WorkflowColumnPrefixedHistoryComponent } from './subcomponents/workflow-column-prefixed-history/workflow-column-prefixed-history.component';
import { WorkflowCardHeaderComponent } from './subcomponents/workflow-card-header/workflow-card-header.component';

@NgModule({
  declarations: [WorkflowCardDetailsComponent, WorkflowCardColumnComponent, WorkflowColumnCustomizableEntityComponent, WorkflowColumnCustomizableCustomComponent, WorkflowColumnTemplatesBudgetsComponent, WorkflowColumnTemplatesAttachmentsComponent, WorkflowColumnPrefixedInformationComponent, WorkflowColumnPrefixedTasksComponent, WorkflowColumnPrefixedHistoryComponent, WorkflowCardHeaderComponent],
  imports: [CommonModule, SharedModule, WorkflowCardDetailsRoutingModule]
})
export class WorkflowCardDetailsModule {}
