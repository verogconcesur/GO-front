import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowDataDetailsComponent } from './workflow-data-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowDataDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowDataDetailsRoutingModule {}
