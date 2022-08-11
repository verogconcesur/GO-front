import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-workflow-navbar-filter',
  templateUrl: './workflow-navbar-filter.component.html',
  styleUrls: ['./workflow-navbar-filter.component.scss']
})
export class WorkflowNavbarFilterComponent implements OnInit, OnDestroy {
  public mobileView = false;
  constructor(private workflowService: WorkflowsService) {}

  @HostListener('window:resize', ['$event']) onResize(event: { target: { innerWidth: number } }) {
    this.mobileView = event.target.innerWidth <= 1280;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.workflowService.resetWorkflowFilter();
  }
}
