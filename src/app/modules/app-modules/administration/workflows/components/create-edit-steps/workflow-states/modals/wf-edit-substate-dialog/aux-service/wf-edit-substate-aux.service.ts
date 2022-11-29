/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TreeNode from '@data/interfaces/tree-node';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin, of, Subject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

export enum TAB_IDS {
  GENERAL = 'GENERAL',
  STATE_PERMISSIONS = 'STATE_PERMISSIONS',
  MOVEMENTS = 'MOVEMENTS',
  EVENTS = 'EVENTS'
}

@Injectable({
  providedIn: 'root'
})
export class WEditSubstateFormAuxService {
  public saveAction$ = new Subject();
  public nextStep$ = new Subject();
  public resetForm$ = new Subject();
  public saveActionClicked = false;
  public allStatesAndSubstates: TreeNode[];
  public workflowRoles: WorkflowRoleDTO[];
  private formsOriginalData: any = {};
  private form: UntypedFormGroup;

  constructor(
    private fb: FormBuilder,
    private workflowService: WorkflowAdministrationService,
    private substatesService: WorkflowAdministrationStatesSubstatesService,
    public spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {
    this.initForm();
  }

  public destroy(): void {
    this.initForm();
    this.formsOriginalData = [];
  }

  public setFormGroupByTab = (form: UntypedFormGroup, idTab: TAB_IDS): void => {
    this.form.controls[idTab] = form;
  };

  public getFormGroupByTab = (idTab?: TAB_IDS): UntypedFormGroup => {
    if (idTab) {
      return this.form.get(idTab) as UntypedFormGroup;
    }
    return this.form;
  };

  public isFormGroupSettedAndNotDirtyOrTouched(id: TAB_IDS): boolean {
    return (
      this.form &&
      this.form.get(id) &&
      this.getFormGroupByTab(id).valid &&
      !this.getFormGroupByTab(id).dirty &&
      !this.getFormGroupByTab(id).touched
    );
  }

  public setFormOriginalData(data: any, idTab: TAB_IDS): void {
    this.formsOriginalData[idTab] = data;
  }

  public getFormOriginalData(id: TAB_IDS): any {
    return this.formsOriginalData[id];
  }

  public saveTab(nextStep: boolean): void {
    this.saveActionClicked = true;
    this.saveAction$.next(nextStep);
  }

  public resetForm(): void {
    this.resetForm$.next(true);
  }

  public fetchAllStatesSubstatesAndRoles(
    workflowId: number,
    state: WorkflowStateDTO,
    substate: WorkflowSubstateDTO
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const resquests = [
        this.workflowService.getWorkflowUserRoles(workflowId).pipe(take(1)),
        this.substatesService.getAllStatesAndSubstates().pipe(take(1))
      ];
      forkJoin(resquests).subscribe(
        (responses: [WorkflowRoleDTO[], WorkflowStateDTO[]]) => {
          this.workflowRoles = responses[0];
          this.allStatesAndSubstates = [];
          if (responses[1]?.length) {
            this.allStatesAndSubstates = this.createTree(responses[1], workflowId, state, substate);
          }
          resolve(true);
        },
        (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          resolve(false);
        }
      );
    });
  }

  public newEmptyMove(): WorkflowSubstateEventDTO {
    return {
      id: null,
      requiredFields: false,
      requiredFieldsList: [],
      requiredHistoryComment: false,
      requiredMyself: false,
      requiredSize: false,
      requiredUser: false,
      sendMail: false,
      sendMailAuto: false,
      sendMailReceiverRole: null,
      sendMailReceiverType: null,
      sendMailTemplate: null,
      signDocument: false,
      signDocumentTemplate: null,
      movementExtraAuto: false,
      movementExtraConfirm: false,
      requiredMovementExtra: false
    };
  }

  private initForm(): void {
    this.form = this.fb.group({
      GENERAL: this.fb.group({}),
      STATE_PERMISSIONS: this.fb.group({}),
      MOVEMENTS: this.fb.group({}),
      EVENTS: this.fb.group({})
    });
  }

  private createTree(
    data: WorkflowStateDTO[],
    workflowId: number,
    thisState: WorkflowStateDTO,
    thisSubstate: WorkflowSubstateDTO
  ): TreeNode[] {
    const treeNode: TreeNode[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherWorkflows: any = {};
    const workflowsIdsFound: number[] = [];
    data.forEach((state: WorkflowStateDTO) => {
      if (state.id === thisState.id && thisState.workflowSubstates.length === 1) {
        return;
      }
      if (workflowsIdsFound.indexOf(state.workflow.id) === -1) {
        //Es un workflow nuevo
        workflowsIdsFound.push(state.workflow.id);
        const dataToPush = {
          ...state.workflow,
          name: `${this.translateService.instant('cards.workflows')}: ${state.workflow.name}`,
          children: [
            {
              ...state,
              name: `${this.translateService.instant('common.state')}: ${state.name}`,
              children: [
                ...state.workflowSubstates
                  .filter((wfSubs: WorkflowSubstateDTO) => wfSubs.id !== thisSubstate.id)
                  .map((wfSubs: WorkflowSubstateDTO) => ({
                    ...wfSubs,
                    workflowState: { ...state, children: [], workflowSubstates: [] }
                  }))
              ]
            }
          ]
        };
        if (state.workflow.id === workflowId) {
          //Es el workflow que estamos editando
          treeNode.push(dataToPush);
        } else {
          //Es otro workflow
          otherWorkflows[state.workflow.id] = dataToPush;
        }
      } else {
        //Ya tenemos este workflow
        const dataToPush = {
          ...state,
          name: `${this.translateService.instant('common.state')}: ${state.name}`,
          children: [
            ...state.workflowSubstates
              .filter((wfSubs: WorkflowSubstateDTO) => wfSubs.id !== thisSubstate.id)
              .map((wfSubs: WorkflowSubstateDTO) => ({
                ...wfSubs,
                workflowState: { ...state, children: [], workflowSubstates: [] }
              }))
          ]
        };
        if (state.workflow.id === workflowId) {
          //Es el workflow que estamos editando
          treeNode[0].children.push(dataToPush);
        } else {
          //Es otro workflow
          otherWorkflows[state.workflow.id].children.push(dataToPush);
        }
      }
    });
    const otherWorkflowsNode: TreeNode = {
      name: this.translateService.instant(marker('cards.otherWorkflows')),
      children: []
    };
    Object.keys(otherWorkflows).forEach((k) => {
      otherWorkflowsNode.children.push(otherWorkflows[k]);
    });
    treeNode.push(otherWorkflowsNode);
    return treeNode;
  }
}
