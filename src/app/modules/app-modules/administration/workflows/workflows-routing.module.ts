import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants, RoutePermissionConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { WorkflowDetailComponent } from './components/workflow-detail/workflow-detail.component';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowListComponent,
    canActivate: [AuthGuardService],
    data: { permissions: RoutePermissionConstants.ADMINISTRATION }
  },
  {
    path: RouteConstants.CREATE_WORKFLOW,
    component: WorkflowDetailComponent,
    canActivate: [AuthGuardService],
    data: { permissions: RoutePermissionConstants.ADMINISTRATION }
  },
  {
    path: `${RouteConstants.EDIT}/${RouteConstants.ID_WORKFLOW}`,
    component: WorkflowDetailComponent,
    canActivate: [AuthGuardService],
    data: { permissions: RoutePermissionConstants.ADMINISTRATION }
  },
  {
    path: RouteConstants.OTHER,
    pathMatch: 'full',
    redirectTo: RouteConstants.LOGIN
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowsRoutingModule {}
