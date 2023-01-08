import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { CreateEditChecklistComponent } from './create-edit-checklist.component';

const routes: Routes = [
  { path: RouteConstants.EMPTY, component: CreateEditChecklistComponent },
  {
    path: `${RouteConstants.ID}`,
    component: CreateEditChecklistComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateEditChecklistsRoutingModule {}
