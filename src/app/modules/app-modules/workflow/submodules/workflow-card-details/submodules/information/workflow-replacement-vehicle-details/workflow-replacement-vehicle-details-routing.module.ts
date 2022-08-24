import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowReplacementVehicleDetailsComponent } from './workflow-replacement-vehicle-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowReplacementVehicleDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowReplacementVehicleDetailsRoutingModule {}
