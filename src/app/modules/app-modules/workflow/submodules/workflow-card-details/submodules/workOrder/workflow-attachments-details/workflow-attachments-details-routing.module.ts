import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowAttachmentsDetailsComponent } from './workflow-attachments-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowAttachmentsDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowAttachmentsDetailsRoutingModule {}
