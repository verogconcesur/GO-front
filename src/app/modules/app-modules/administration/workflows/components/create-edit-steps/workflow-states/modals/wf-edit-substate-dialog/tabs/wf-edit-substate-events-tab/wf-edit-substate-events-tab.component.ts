import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TreeNode from '@data/interfaces/tree-node';
import RoleDTO from '@data/models/user-permissions/role-dto';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
// eslint-disable-next-line max-len
import { WfEditSubstateEventsDialogComponent } from '../../../wf-edit-substate-events-dialog/wf-edit-substate-events-dialog.component';
import { WEditSubstateFormAuxService } from '../../aux-service/wf-edit-substate-aux.service';
import { WfEditSubstateAbstractTabClass } from '../wf-edit-substate-abstract-tab-class';

@Component({
  selector: 'app-wf-edit-substate-events-tab',
  templateUrl: './wf-edit-substate-events-tab.component.html',
  styleUrls: ['./wf-edit-substate-events-tab.component.scss']
})
export class WfEditSubstateEventsTabComponent extends WfEditSubstateAbstractTabClass implements OnInit {
  @ViewChild('InEvents') InEvents: WfEditSubstateEventsDialogComponent;
  @ViewChild('OutEvents') OutEvents: WfEditSubstateEventsDialogComponent;
  public labels = {
    inputEvent: marker('workflows.inputEvent'),
    exitEvent: marker('workflows.exitEvent')
  };
  public extendedComponentDataIN: {
    workflowId: number;
    state: WorkflowStateDTO;
    substate: WorkflowSubstateDTO;
    move: WorkflowSubstateEventDTO;
    eventType: 'IN' | 'OUT';
  };
  public extendedComponentDataOUT: {
    workflowId: number;
    state: WorkflowStateDTO;
    substate: WorkflowSubstateDTO;
    move: WorkflowSubstateEventDTO;
    eventType: 'IN' | 'OUT';
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

  ngOnInit(): void {
    super.ngOnInit();
  }

  public initForm(data: WorkflowSubstateEventDTO[]): void {
    const extendedComponentDataIN = {
      workflowId: this.workflowId,
      state: this.state,
      substate: this.substate,
      move: this.editSubstateAuxService.newEmptyMove(),
      eventType: 'IN' as 'IN' | 'OUT'
    };
    const extendedComponentDataOUT = {
      workflowId: this.workflowId,
      state: this.state,
      substate: this.substate,
      move: this.editSubstateAuxService.newEmptyMove(),
      eventType: 'OUT' as 'IN' | 'OUT'
    };
    data = data?.length ? data : [];
    data.forEach((d: WorkflowSubstateEventDTO) => {
      if (d.substateEventType === 'IN') {
        extendedComponentDataIN.move = d;
      } else if (d.substateEventType === 'OUT') {
        extendedComponentDataOUT.move = d;
      }
    });
    this.extendedComponentDataIN = extendedComponentDataIN;
    this.extendedComponentDataOUT = extendedComponentDataOUT;
  }

  public formIntialized(): void {
    if (this.InEvents.form && this.OutEvents.form) {
      const form = this.fb.group({
        in: this.InEvents.form,
        out: this.OutEvents.form
      });
      this.editSubstateAuxService.setFormGroupByTab(form, this.tabId);
      this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
    }
  }

  public saveData(): void {
    const spinner = this.spinnerService.show();
    const data: WorkflowSubstateEventDTO[] = [];
    data.push({
      ...this.extendedComponentDataIN.move,
      substateEventType: 'IN',
      ...this.InEvents.getFormValue()
    });
    data.push({
      ...this.extendedComponentDataOUT.move,
      substateEventType: 'OUT',
      ...this.OutEvents.getFormValue()
    });

    this.substatesService
      .postWorkflowSubstateEvents(this.workflowId, this.substate.id, data)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (responses: WorkflowSubstateEventDTO[]) => {
          responses.forEach((d) => {
            if (d.substateEventType === 'IN') {
              this.extendedComponentDataIN = { ...this.extendedComponentDataIN, move: d };
            } else if (d.substateEventType === 'OUT') {
              this.extendedComponentDataOUT = { ...this.extendedComponentDataOUT, move: d };
            }
          });
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
        },
        error: (error: ConcenetError) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getData(): Observable<any> {
    return this.substatesService.getWorkflowSubstateEvents(this.workflowId, this.substate.id).pipe(take(1));
  }
}
