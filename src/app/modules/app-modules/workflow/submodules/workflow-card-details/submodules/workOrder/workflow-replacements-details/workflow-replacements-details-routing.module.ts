import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
// eslint-disable-next-line max-len
import { WorkflowReplacementVehicleDetailsComponent } from '../../information/workflow-replacement-vehicle-details/workflow-replacement-vehicle-details.component';

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
export class WorkflowReplacementsDetailsRoutingModule {}
