import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AdvancedSearchComponent } from './advanced-search.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: AdvancedSearchComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvancedSearchRoutingModule {}
