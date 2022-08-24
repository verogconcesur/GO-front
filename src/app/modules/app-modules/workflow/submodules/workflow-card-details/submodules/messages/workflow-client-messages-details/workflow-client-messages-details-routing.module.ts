import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowClientMessagesDetailsComponent } from './workflow-client-messages-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowClientMessagesDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowClientMessagesDetailsRoutingModule {}
