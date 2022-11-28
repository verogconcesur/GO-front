import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { WEditSubstateFormAuxService } from '../../aux-service/wf-edit-substate-aux.service';
import { WfEditSubstateAbstractTabClass } from '../wf-edit-substate-abstract-tab-class';

@Component({
  selector: 'app-wf-edit-substate-events-tab',
  templateUrl: './wf-edit-substate-events-tab.component.html',
  styleUrls: ['./wf-edit-substate-events-tab.component.scss']
})
export class WfEditSubstateEventsTabComponent extends WfEditSubstateAbstractTabClass implements OnInit {
  public labels = {
    inputEvent: marker('workflows.inputEvent'),
    exitEvent: marker('workflows.exitEvent')
  };

  constructor(
    private fb: FormBuilder,
    public editSubstateAuxService: WEditSubstateFormAuxService,
    private substatesService: WorkflowAdministrationStatesSubstatesService,
    public spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {
    super(editSubstateAuxService, spinnerService);
  }

  public initForm(data: WorkflowSubstateDTO): void {
    const form = this.fb.group({});
    this.editSubstateAuxService.setFormGroupByTab(form, this.tabId);
    this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
  }

  public saveData(): void {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getData(): Observable<any> {
    return forkJoin([this.substatesService.getWorkflowSubstateEvents(this.workflowId, this.substate.id).pipe(take(1))]);
  }
}
