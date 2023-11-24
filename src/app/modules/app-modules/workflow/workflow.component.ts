import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkflowsService } from '@data/services/workflows.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit, OnDestroy {
  constructor(private workflowService: WorkflowsService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.workflowService.workflowSelectedSubject$.next(null);
  }
}
