import { Component, OnInit } from '@angular/core';
import WorkflowDto from '@data/models/workflows/workflow-dto';
import WorkflowFilterDto from '@data/models/workflows/workflow-filter-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { take } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-workflow-board-view',
  templateUrl: './workflow-board-view.component.html',
  styleUrls: ['./workflow-board-view.component.scss']
})
export class WorkflowBoardViewComponent implements OnInit {
  public workflow: WorkflowDto = null;

  constructor(private workflowService: WorkflowsService) {}

  ngOnInit(): void {
    this.initListeners();
  }

  public initListeners(): void {
    this.workflowService.workflowSelectedSubject$.pipe(untilDestroyed(this)).subscribe((workflow: WorkflowDto) => {
      this.workflow = workflow;
      this.getData();
    });
    this.workflowService.workflowFilterSubject$.pipe(untilDestroyed(this)).subscribe((filter: WorkflowFilterDto) => {
      console.log('Hay cambios en los filtros: ', filter);
    });
  }

  private getData(): void {
    if (this.workflow) {
      this.workflowService
        .getWorkflowInstances(this.workflow, true)
        .pipe(take(1))
        .subscribe(
          (data: WorkflowStateDto[]) => {
            console.log(data);
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }
}
