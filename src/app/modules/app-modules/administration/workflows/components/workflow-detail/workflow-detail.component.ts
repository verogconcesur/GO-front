import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { CustomDialogService } from '@jenga/custom-dialog';
// eslint-disable-next-line max-len
import {
  CreateEditWorkflowComponent,
  CreateEditWorkflowComponentModalEnum
} from '../modals/create-edit-workflow/create-edit-workflow.component';

@Component({
  selector: 'app-workflow-detail',
  templateUrl: './workflow-detail.component.html',
  styleUrls: ['./workflow-detail.component.scss']
})
export class WorkflowDetailComponent implements OnInit {
  public workflowDetail: WorkflowDTO;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowAdministrationService,
    private customDialogService: CustomDialogService
  ) {}

  public getWorkflowInfo() {
    this.route.paramMap.subscribe((params) => {
      const idWorkflow = Number(params.get('idWorkflow'));
      if (idWorkflow) {
        this.workflowService.getWorkflow(idWorkflow).subscribe((res) => {
          this.workflowDetail = res;
        });
      } else {
        this.customDialogService
          .open({
            id: CreateEditWorkflowComponentModalEnum.ID,
            panelClass: CreateEditWorkflowComponentModalEnum.PANEL_CLASS,
            component: CreateEditWorkflowComponent,
            extendedComponentData: null,
            disableClose: true,
            width: '900px'
          })
          .subscribe((res) => {
            if (res) {
              this.workflowDetail = res;
            } else {
              this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.ADM_WORKFLOWS]);
            }
          });
      }
    });
  }
  ngOnInit(): void {
    this.getWorkflowInfo();
  }
}
