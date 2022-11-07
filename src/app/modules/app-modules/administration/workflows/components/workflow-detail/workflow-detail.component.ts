import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';

@Component({
  selector: 'app-workflow-detail',
  templateUrl: './workflow-detail.component.html',
  styleUrls: ['./workflow-detail.component.scss']
})
export class WorkflowDetailComponent implements OnInit {
  public workflowDetail: WorkflowDTO;
  constructor(private route: ActivatedRoute, private workflowService: WorkflowAdministrationService) {}

  public getWorkflowInfo() {
    this.route.paramMap.subscribe((params) => {
      const idWorkflow = Number(params.get('idWorkflow'));
      if (idWorkflow) {
        this.workflowService.getWorkflow(idWorkflow).subscribe((res) => {
          this.workflowDetail = res;
        });
      } else {
      }
    });
  }
  ngOnInit(): void {
    this.getWorkflowInfo();
  }
}
