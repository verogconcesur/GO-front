import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { BudgetsComponent } from './budgets.component';

const routes: Routes = [{ path: RouteConstants.EMPTY, component: BudgetsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BudgetsRoutingModule {}
