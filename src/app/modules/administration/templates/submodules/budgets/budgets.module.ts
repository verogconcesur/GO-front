import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BudgetsRoutingModule } from './budgets-routing.module';
import { BudgetsComponent } from './budgets.component';


@NgModule({
  declarations: [
    BudgetsComponent
  ],
  imports: [
    CommonModule,
    BudgetsRoutingModule
  ]
})
export class BudgetsModule { }
