import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowPaymentsDetailsComponent } from './workflow-payments-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowPaymentsDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowPaymentsDetailsRoutingModule {}
