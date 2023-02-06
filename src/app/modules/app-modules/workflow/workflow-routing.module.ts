/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { WorkflowComponent } from './workflow.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    canActivate: [AuthGuardService],
    children: [
      {
        path: RouteConstants.WORKFLOWS_BOARD_VIEW,
        canActivate: [AuthGuardService],
        component: WorkflowComponent,
        loadChildren: () =>
          import('./submodules/workflow-board-view/workflow-board-view.module').then((m) => m.WorkflowBoardViewModule)
      },
      {
        path: RouteConstants.WORKFLOWS_CALENDAR_VIEW,
        canActivate: [AuthGuardService],
        component: WorkflowComponent,
        loadChildren: () =>
          import('./submodules/workflow-calendar-view/workflow-calendar-view.module').then((m) => m.WorkflowCalendarViewModule)
      },
      {
        path: RouteConstants.WORKFLOWS_TABLE_VIEW,
        canActivate: [AuthGuardService],
        component: WorkflowComponent,
        loadChildren: () =>
          import('./submodules/workflow-table-view/workflow-table-view.module').then((m) => m.WorkflowTableViewModule)
      },
      {
        path: `${RouteConstants.WORKFLOW_ID}/${RouteConstants.WORKFLOWS_BOARD_VIEW}/${RouteConstants.WORKFLOWS_CARD_SIGN}/${RouteConstants.ID_CARD}/${RouteConstants.ID_USER}`,
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('../../feature-modules/sign-card-documents-dialog/sign-card-documents-dialog.module').then(
            (m) => m.SignCardDocumentsDialogModule
          )
      },
      {
        path: `${RouteConstants.WORKFLOW_ID}/${RouteConstants.WORKFLOWS_BOARD_VIEW}`,
        canActivate: [AuthGuardService],
        component: WorkflowComponent,
        loadChildren: () =>
          import('./submodules/workflow-board-view/workflow-board-view.module').then((m) => m.WorkflowBoardViewModule)
      },
      {
        path: `${RouteConstants.WORKFLOW_ID}/${RouteConstants.WORKFLOWS_CALENDAR_VIEW}/${RouteConstants.WORKFLOWS_CARD_SIGN}/${RouteConstants.ID_CARD}/${RouteConstants.ID_USER}`,
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('../../feature-modules/sign-card-documents-dialog/sign-card-documents-dialog.module').then(
            (m) => m.SignCardDocumentsDialogModule
          )
      },
      {
        path: `${RouteConstants.WORKFLOW_ID}/${RouteConstants.WORKFLOWS_CALENDAR_VIEW}`,
        canActivate: [AuthGuardService],
        component: WorkflowComponent,
        loadChildren: () =>
          import('./submodules/workflow-calendar-view/workflow-calendar-view.module').then((m) => m.WorkflowCalendarViewModule)
      },
      {
        path: `${RouteConstants.WORKFLOW_ID}/${RouteConstants.WORKFLOWS_TABLE_VIEW}/${RouteConstants.WORKFLOWS_CARD_SIGN}/${RouteConstants.ID_CARD}/${RouteConstants.ID_USER}`,
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('../../feature-modules/sign-card-documents-dialog/sign-card-documents-dialog.module').then(
            (m) => m.SignCardDocumentsDialogModule
          )
      },
      {
        path: `${RouteConstants.WORKFLOW_ID}/${RouteConstants.WORKFLOWS_TABLE_VIEW}`,
        canActivate: [AuthGuardService],
        component: WorkflowComponent,
        loadChildren: () =>
          import('./submodules/workflow-table-view/workflow-table-view.module').then((m) => m.WorkflowTableViewModule)
      },
      {
        path: RouteConstants.OTHER,
        canActivate: [AuthGuardService],
        redirectTo: RouteConstants.WORKFLOWS_TABLE_VIEW
      },
      {
        path: RouteConstants.EMPTY,
        canActivate: [AuthGuardService],
        redirectTo: RouteConstants.WORKFLOWS_TABLE_VIEW
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {}
