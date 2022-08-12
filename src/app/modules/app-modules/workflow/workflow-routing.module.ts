import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { WorkflowComponent } from './workflow.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    canActivate: [AuthGuardService],
    component: WorkflowComponent,
    children: [
      {
        path: RouteConstants.WORKFLOWS_BOARD_VIEW,
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./submodules/workflow-board-view/workflow-board-view.module').then((m) => m.WorkflowBoardViewModule)
      },
      {
        path: RouteConstants.WORKFLOWS_CALENDAR_VIEW,
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./submodules/workflow-calendar-view/workflow-calendar-view.module').then((m) => m.WorkflowCalendarViewModule)
      },
      {
        path: RouteConstants.WORKFLOWS_TABLE_VIEW,
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./submodules/workflow-table-view/workflow-table-view.module').then((m) => m.WorkflowTableViewModule)
      },
      {
        path: RouteConstants.OTHER,
        canActivate: [AuthGuardService],
        redirectTo: RouteConstants.WORKFLOWS_BOARD_VIEW
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {}
