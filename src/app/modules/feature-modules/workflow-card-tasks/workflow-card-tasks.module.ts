import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowCardTasksComponent } from './workflow-card-tasks.component';
import { SharedModule } from '@shared/shared.module';
import { TaskComponent } from './task/task.component';
import { TasksModalComponent } from './tasks-modal/tasks-modal.component';

@NgModule({
  declarations: [WorkflowCardTasksComponent, TaskComponent, TasksModalComponent],
  imports: [CommonModule, SharedModule],
  exports: [WorkflowCardTasksComponent, TasksModalComponent]
})
export class WorkflowCardTasksModule {}
