/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { WorkflowCardDetailsComponent } from './workflow-card-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    canActivate: [AuthGuardService],
    component: WorkflowCardDetailsComponent,
    children: [
      // information: ['vehicle', 'client', 'replacementVehicle', 'history'],
      {
        path: `vehicle`,
        outlet: 'information',
        loadChildren: () =>
          import('../workflow-card-details/submodules/information/workflow-vehicle-details/workflow-vehicle-details.module').then(
            (m) => m.WorkflowVehicleDetailsModule
          )
      },
      {
        path: `client`,
        outlet: 'information',
        loadChildren: () =>
          import('../workflow-card-details/submodules/information/workflow-client-details/workflow-client-details.module').then(
            (m) => m.WorkflowClientDetailsModule
          )
      },
      {
        path: `replacementVehicle`,
        outlet: 'information',
        loadChildren: () =>
          import(
            '../workflow-card-details/submodules/information/workflow-replacement-vehicle-details/workflow-replacement-vehicle-details.module'
          ).then((m) => m.WorkflowReplacementVehicleDetailsModule)
      },
      {
        path: `history`,
        outlet: 'information',
        loadChildren: () =>
          import('../workflow-card-details/submodules/information/workflow-history-details/workflow-history-details.module').then(
            (m) => m.WorkflowHistoryDetailsModule
          )
      },
      // workOrder: ['information', 'data', 'adviser', 'budget', 'payments', 'replacements', 'attachments', 'tasks'],
      {
        path: `information`,
        outlet: 'workOrder',
        loadChildren: () =>
          import(
            '../workflow-card-details/submodules/workOrder/workflow-information-details/workflow-information-details.module'
          ).then((m) => m.WorkflowInformationDetailsModule)
      },
      {
        path: `data`,
        outlet: 'workOrder',
        loadChildren: () =>
          import('../workflow-card-details/submodules/workOrder/workflow-data-details/workflow-data-details.module').then(
            (m) => m.WorkflowDataDetailsModule
          )
      },
      {
        path: `adviser`,
        outlet: 'workOrder',
        loadChildren: () =>
          import('../workflow-card-details/submodules/workOrder/workflow-adviser-details/workflow-adviser-details.module').then(
            (m) => m.WorkflowAdviserDetailsModule
          )
      },
      {
        path: `budget`,
        outlet: 'workOrder',
        loadChildren: () =>
          import('../workflow-card-details/submodules/workOrder/workflow-budget-details/workflow-budget-details.module').then(
            (m) => m.WorkflowBudgetDetailsModule
          )
      },
      {
        path: `payments`,
        outlet: 'workOrder',
        loadChildren: () =>
          import('../workflow-card-details/submodules/workOrder/workflow-payments-details/workflow-payments-details.module').then(
            (m) => m.WorkflowPaymentsDetailsModule
          )
      },
      {
        path: `replacements`,
        outlet: 'workOrder',
        loadChildren: () =>
          import(
            '../workflow-card-details/submodules/workOrder/workflow-replacements-details/workflow-replacements-details.module'
          ).then((m) => m.WorkflowReplacementsDetailsModule)
      },
      {
        path: `attachments`,
        outlet: 'workOrder',
        loadChildren: () =>
          import(
            '../workflow-card-details/submodules/workOrder/workflow-attachments-details/workflow-attachments-details.module'
          ).then((m) => m.WorkflowAttachmentsDetailsModule)
      },
      {
        path: `tasks`,
        outlet: 'workOrder',
        loadChildren: () =>
          import('../workflow-card-details/submodules/workOrder/workflow-tasks-details/workflow-tasks-details.module').then(
            (m) => m.WorkflowTasksDetailsModule
          )
      },
      // messages: ['comments', 'clientMessages']
      {
        path: `comments`,
        outlet: 'messages',
        loadChildren: () =>
          import('../workflow-card-details/submodules/messages/workflow-comments-details/workflow-comments-details.module').then(
            (m) => m.WorkflowCommentsDetailsModule
          )
      },
      {
        path: `clientMessages`,
        outlet: 'messages',
        loadChildren: () =>
          import(
            '../workflow-card-details/submodules/messages/workflow-client-messages-details/workflow-client-messages-details.module'
          ).then((m) => m.WorkflowClientMessagesDetailsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowCardDetailsRoutingModule {}
