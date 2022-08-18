import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { WorkflowFilterService } from '../../aux-service/workflow-filter.service';
import { WorkflowNavbarFilterFormComponent } from '../workflow-navbar-filter-form/workflow-navbar-filter-form.component';

@UntilDestroy()
@Component({
  selector: 'app-workflow-navbar-filter',
  templateUrl: './workflow-navbar-filter.component.html',
  styleUrls: ['./workflow-navbar-filter.component.scss']
})
export class WorkflowNavbarFilterComponent implements OnInit, OnDestroy {
  @ViewChild('workflowNavbarFilterForm') workflowNavbarFilterForm: WorkflowNavbarFilterFormComponent;
  public mobileView = false;
  constructor(public workflowFilterService: WorkflowFilterService) {}

  @HostListener('window:resize', ['$event']) onResize(event: { target: { innerWidth: number } }) {
    this.mobileView = event.target.innerWidth <= 1280;
  }

  ngOnInit(): void {
    this.mobileView = window.innerWidth <= 1280;
  }

  ngOnDestroy(): void {
    this.workflowFilterService.resetWorkflowFilter();
  }

  public filterSubstatesWithCards(): void {}
}
