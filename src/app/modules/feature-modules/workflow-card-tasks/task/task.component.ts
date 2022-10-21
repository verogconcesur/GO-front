import { Component, Input, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardTaskDTO } from '@data/models/cards/card-tasks-dto';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  @Input() task: CardTaskDTO;
  public labels = {
    workflow: marker('cards.workflows'),
    state: marker('common.state'),
    completed: marker('common.completed'),
    pending: marker('common.pending')
  };

  constructor() {}

  ngOnInit(): void {}

  public getTaskStatusClass(): string {
    return this.task.taskStatus === 'COMPLETED' ? 'completed' : 'pending';
  }

  public getStatusLabel(): string {
    return this.task.taskStatus === 'COMPLETED' ? this.labels.completed : this.labels.pending;
  }

  public getTaskState(): string {
    let state = '';
    if (this.task.workflowSubstate?.workflowState?.name) {
      state = this.task.workflowSubstate?.workflowState?.name;
    }
    if (this.task.workflowSubstate?.name) {
      state += ` (${this.task.workflowSubstate?.name})`;
    }
    return state;
  }
}
