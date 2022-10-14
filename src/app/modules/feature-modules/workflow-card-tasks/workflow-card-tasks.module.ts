import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowCardTasksComponent } from './workflow-card-tasks.component';
import { SharedModule } from '@shared/shared.module';
import { TaskComponent } from './task/task.component';

@NgModule({
  declarations: [WorkflowCardTasksComponent, TaskComponent],
  imports: [CommonModule, SharedModule],
  exports: [WorkflowCardTasksComponent]
})
export class WorkflowCardTasksModule {}
