import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { WorkflowBoardViewComponent } from './workflow-board-view.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    canActivate: [AuthGuardService],
    component: WorkflowBoardViewComponent,
    children: [
      {
        path: `${RouteConstants.WORKFLOWS_ID_CARD}/${RouteConstants.ID}`,
        outlet: RouteConstants.WORKFLOWS_CARD,
        loadChildren: () =>
          import('../workflow-card-details/workflow-card-details.module').then((m) => m.WorkflowCardDetailsModule)
      },
      {
        path: RouteConstants.OTHER,
        canActivate: [AuthGuardService],
        redirectTo: RouteConstants.EMPTY
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowBoardViewRoutingModule {}
