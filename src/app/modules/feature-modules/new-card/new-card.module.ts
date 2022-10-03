import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewCardComponent } from './new-card.component';
import { SharedModule } from '@shared/shared.module';
import { StepWorkflowComponent } from './components/step-workflow/step-workflow.component';
import { StepColumnComponent } from './components/step-column/step-column.component';

@NgModule({
  declarations: [NewCardComponent, StepWorkflowComponent, StepColumnComponent],
  imports: [CommonModule, SharedModule],
  exports: [NewCardComponent]
})
export class NewCardModule {}
