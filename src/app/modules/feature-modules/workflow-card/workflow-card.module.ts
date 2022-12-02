import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowCardComponent } from './workflow-card.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [WorkflowCardComponent],
  imports: [CommonModule, SharedModule],
  exports: [WorkflowCardComponent]
})
export class WorkflowCardModule {}
