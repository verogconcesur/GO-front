import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowBudgetDetailsComponent } from './workflow-budget-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowBudgetDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowBudgetDetailsRoutingModule {}
