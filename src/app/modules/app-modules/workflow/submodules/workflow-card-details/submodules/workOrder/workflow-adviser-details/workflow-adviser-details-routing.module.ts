import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowAdviserDetailsComponent } from './workflow-adviser-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowAdviserDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowAdviserDetailsRoutingModule {}
