import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCreateCardDTO from '@data/models/workflows/workflow-create-card-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-step1-workflow',
  templateUrl: './step-workflow.component.html',
  styleUrls: ['./step-workflow.component.scss']
})
export class StepWorkflowComponent implements OnInit {
  @Input() formWorkflow: FormGroup;
  @Input() title: string;
  public labels = {
    workflowHeader: marker('newCard.workflow.header'),
    workflowLabel: marker('newCard.workflow.select'),
    facility: marker('newCard.workflow.facility'),
    status: marker('newCard.workflow.states'),
    entryState: marker('newCard.workflow.entryState'),
    subState: marker('newCard.workflow.subState'),
    required: marker('errors.required')
  };
  public workflowList: WorkflowCreateCardDTO[] = [];
  public facilityList: { id: number; name: string }[] = [];
  public entryStateList: WorkflowStateDTO[] = [];
  public subStateList: WorkflowSubstateDTO[] = [];
  constructor(private fb: FormBuilder, private workflowsService: WorkflowsService) {}
  public initialiceList() {
    this.facilityList = this.formWorkflow.get('workflow').value.facilities;
    this.entryStateList = this.formWorkflow.get('workflow').value.workflowStates;
    if (this.facilityList.length === 1) {
      this.formWorkflow.get('facility').setValue(this.facilityList[0]);
    }
    if (this.entryStateList.length === 1) {
      this.formWorkflow.get('entryState').setValue(this.entryStateList[0]);
      this.initialiceSubStates();
    }
  }
  public initialiceSubStates() {
    this.subStateList = this.formWorkflow.get('entryState').value.workflowSubstates;
    if (this.subStateList.length === 1) {
      this.formWorkflow.get('subState').setValue(this.subStateList[0]);
    }
  }
  ngOnInit(): void {
    this.workflowsService
      .getWorkflowsCreatecardList()
      .pipe(take(1))
      .subscribe((res) => {
        this.workflowList = res;
      });
  }
}
