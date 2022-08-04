import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import WorkflowFilterDto from '@data/models/workflows/workflow-filter-dto';

@UntilDestroy()
@Component({
  selector: 'app-workflow-navbar-filter',
  templateUrl: './workflow-navbar-filter.component.html',
  styleUrls: ['./workflow-navbar-filter.component.scss']
})
export class WorkflowNavbarFilterComponent implements OnInit, OnDestroy {
  public mobileView = false;
  constructor(private workflowService: WorkflowsService) {}

  ngOnInit(): void {
    window.onresize = () => (this.mobileView = window.innerWidth <= 1220);
  }

  ngOnDestroy(): void {
    this.workflowService.resetWorkflowFilter();
  }
}
