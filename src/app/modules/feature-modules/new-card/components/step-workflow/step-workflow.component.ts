import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCreateCardDTO from '@data/models/workflows/workflow-create-card-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-step1-workflow',
  templateUrl: './step-workflow.component.html',
  styleUrls: ['./step-workflow.component.scss']
})
export class StepWorkflowComponent implements OnInit {
  @Input() formWorkflow: FormGroup;
  @Input() title: string;
  @Input() currentWorkflowId: number;
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
  constructor(private workflowsService: WorkflowsService) {}
  public initialiceList() {
    this.facilityList = this.formWorkflow.get('workflow').value ? this.formWorkflow.get('workflow').value.facilities : [];
    this.entryStateList = this.formWorkflow.get('workflow').value ? this.formWorkflow.get('workflow').value.workflowStates : [];
    const selectedFacility = this.formWorkflow.get('facility').value;
    if (selectedFacility) {
      this.formWorkflow.get('facility').setValue(
        this.facilityList.find((facility: { id: number; name: string }) => facility.id === selectedFacility.id),
        { emitEvent: false }
      );
    } else if (this.facilityList.length === 1) {
      this.formWorkflow.get('facility').setValue(this.facilityList[0], { emitEvent: false });
    }
    const selectedEntryState = this.formWorkflow.get('entryState').value;
    if (selectedEntryState) {
      this.formWorkflow.get('entryState').setValue(
        this.entryStateList.find((entryState: WorkflowStateDTO) => entryState.id === selectedEntryState.id),
        { emitEvent: false }
      );
      this.initialiceSubStates();
    } else if (this.entryStateList.length === 1) {
      this.formWorkflow.get('entryState').setValue(this.entryStateList[0], { emitEvent: false });
      this.initialiceSubStates();
    }
  }
  public initialiceSubStates() {
    this.subStateList = this.formWorkflow.get('entryState').value.workflowSubstates;
    const selectedSubState = this.formWorkflow.get('subState').value;
    if (selectedSubState) {
      this.formWorkflow.get('subState').setValue(
        this.subStateList.find((subState: WorkflowSubstateDTO) => subState.id === selectedSubState.id),
        { emitEvent: false }
      );
    } else if (this.subStateList.length === 1) {
      this.formWorkflow.get('subState').setValue(this.subStateList[0], { emitEvent: false });
    }
  }
  ngOnInit(): void {
    this.workflowsService
      .getWorkflowsCreatecardList()
      .pipe(take(1))
      .subscribe((res) => {
        this.workflowList = res;
        const selectedWorkflow = this.formWorkflow.get('workflow').value;
        if (selectedWorkflow) {
          this.formWorkflow.get('workflow').setValue(
            this.workflowList.find((workflow: WorkflowCreateCardDTO) => workflow.id === selectedWorkflow.id),
            { emitEvent: false }
          );
          this.initialiceList();
        } else if (this.currentWorkflowId) {
          this.formWorkflow.get('workflow').setValue(
            this.workflowList.find((workflow: WorkflowCreateCardDTO) => workflow.id === this.currentWorkflowId),
            { emitEvent: false }
          );
          if (this.formWorkflow.get('workflow').value) {
            this.initialiceList();
          }
        }
      });
  }
}
