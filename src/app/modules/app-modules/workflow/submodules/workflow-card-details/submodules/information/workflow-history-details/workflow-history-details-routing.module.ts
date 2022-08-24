import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowHistoryDetailsComponent } from './workflow-history-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowHistoryDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowHistoryDetailsRoutingModule {}
