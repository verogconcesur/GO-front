import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowTasksDetailsComponent } from './workflow-tasks-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowTasksDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowTasksDetailsRoutingModule {}
