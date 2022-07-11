import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BudgetsRoutingModule } from './budgets-routing.module';
import { BudgetsComponent } from './budgets.component';
import { CreateEditBudgetComponent } from './dialog/create-edit-budget/create-edit-budget.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [BudgetsComponent, CreateEditBudgetComponent],
  imports: [CommonModule, SharedModule, BudgetsRoutingModule]
})
export class BudgetsModule {}
