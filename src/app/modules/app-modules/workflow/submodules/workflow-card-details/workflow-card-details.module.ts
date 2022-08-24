/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowCardDetailsRoutingModule } from './workflow-card-details-routing.module';
import { WorkflowCardDetailsComponent } from './workflow-card-details.component';
import { SharedModule } from '@shared/shared.module';
import { WorkflowCardColumnComponent } from './subcomponents/workflow-card-column/workflow-card-column.component';
import { WorkflowVehicleDetailsComponent } from './submodules/information/workflow-vehicle-details/workflow-vehicle-details.component';
import { WorkflowClientDetailsComponent } from './submodules/information/workflow-client-details/workflow-client-details.component';
import { WorkflowReplacementVehicleDetailsComponent } from './submodules/information/workflow-replacement-vehicle-details/workflow-replacement-vehicle-details.component';
import { WorkflowHistoryDetailsComponent } from './submodules/information/workflow-history-details/workflow-history-details.component';
import { WorkflowInformationDetailsComponent } from './submodules/workOrder/workflow-information-details/workflow-information-details.component';
import { WorkflowDataDetailsComponent } from './submodules/workOrder/workflow-data-details/workflow-data-details.component';
import { WorkflowAdviserDetailsComponent } from './submodules/workOrder/workflow-adviser-details/workflow-adviser-details.component';
import { WorkflowBudgetDetailsComponent } from './submodules/workOrder/workflow-budget-details/workflow-budget-details.component';
import { WorkflowPaymentsDetailsComponent } from './submodules/workOrder/workflow-payments-details/workflow-payments-details.component';
import { WorkflowReplacementsDetailsComponent } from './submodules/workOrder/workflow-replacements-details/workflow-replacements-details.component';
import { WorkflowAttachmentsDetailsComponent } from './submodules/workOrder/workflow-attachments-details/workflow-attachments-details.component';
import { WorkflowTasksDetailsComponent } from './submodules/workOrder/workflow-tasks-details/workflow-tasks-details.component';
import { WorkflowCommentsDetailsComponent } from './submodules/messages/workflow-comments-details/workflow-comments-details.component';
import { WorkflowClientMessagesDetailsComponent } from './submodules/messages/workflow-client-messages-details/workflow-client-messages-details.component';

@NgModule({
  declarations: [
    WorkflowCardDetailsComponent,
    WorkflowCardColumnComponent,
    WorkflowVehicleDetailsComponent,
    WorkflowClientDetailsComponent,
    WorkflowReplacementVehicleDetailsComponent,
    WorkflowHistoryDetailsComponent,
    WorkflowInformationDetailsComponent,
    WorkflowDataDetailsComponent,
    WorkflowAdviserDetailsComponent,
    WorkflowBudgetDetailsComponent,
    WorkflowPaymentsDetailsComponent,
    WorkflowReplacementsDetailsComponent,
    WorkflowAttachmentsDetailsComponent,
    WorkflowTasksDetailsComponent,
    WorkflowCommentsDetailsComponent,
    WorkflowClientMessagesDetailsComponent
  ],
  imports: [CommonModule, SharedModule, WorkflowCardDetailsRoutingModule]
})
export class WorkflowCardDetailsModule {}
