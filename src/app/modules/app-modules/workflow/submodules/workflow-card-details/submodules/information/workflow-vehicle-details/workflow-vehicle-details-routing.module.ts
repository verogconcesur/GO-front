import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { WorkflowVehicleDetailsComponent } from './workflow-vehicle-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: WorkflowVehicleDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowVehicleDetailsRoutingModule {}
