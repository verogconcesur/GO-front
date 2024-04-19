import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { CreateEditAccountingComponent } from './create-edit-accounting.component';

const routes: Routes = [
  { path: RouteConstants.EMPTY, component: CreateEditAccountingComponent },
  {
    path: `${RouteConstants.ID}`,
    component: CreateEditAccountingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateEditAccountingsRoutingModule {}
