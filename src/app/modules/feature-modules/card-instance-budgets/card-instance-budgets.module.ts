import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardInstanceBudgetsComponent } from './card-instance-budgets.component';
import { SharedModule } from '@shared/shared.module';
import { SelectTemplateLinesComponent } from './modals/select-template-lines/select-template-lines.component';

@NgModule({
  declarations: [CardInstanceBudgetsComponent, SelectTemplateLinesComponent],
  imports: [CommonModule, SharedModule],
  exports: [CardInstanceBudgetsComponent],
  entryComponents: [SelectTemplateLinesComponent]
})
export class CardInstanceBudgetsModule {}
