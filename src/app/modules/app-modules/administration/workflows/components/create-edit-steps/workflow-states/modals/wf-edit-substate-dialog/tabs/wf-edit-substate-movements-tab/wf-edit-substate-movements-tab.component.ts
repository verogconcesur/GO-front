import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TreeNode from '@data/interfaces/tree-node';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { WEditSubstateFormAuxService } from '../../aux-service/wf-edit-substate-aux.service';
import { WfEditSubstateAbstractTabClass } from '../wf-edit-substate-abstract-tab-class';

@Component({
  selector: 'app-wf-edit-substate-movements-tab',
  templateUrl: './wf-edit-substate-movements-tab.component.html',
  styleUrls: ['./wf-edit-substate-movements-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WfEditSubstateMovementsTabComponent extends WfEditSubstateAbstractTabClass implements OnInit {
  @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  public labels = {
    from: marker('common.from'),
    to: marker('common.to'),
    addMovement: marker('workflows.addMovement')
  };
  public substateMovements: WorkflowMoveDTO[];
  public allStatesAndSubstates: TreeNode[];
  public workflowRoles: WorkflowRoleDTO[];

  constructor(
    private fb: FormBuilder,
    public editSubstateAuxService: WEditSubstateFormAuxService,
    private workflowService: WorkflowAdministrationService,
    private substatesService: WorkflowAdministrationStatesSubstatesService,
    public spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {
    super(editSubstateAuxService, spinnerService);
  }

  get movementsFa(): UntypedFormArray {
    return this.form.get('movements') as UntypedFormArray;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.fetchAllStatesSubstatesAndRoles();
  }

  public initForm(movements: WorkflowMoveDTO[]): void {
    console.log('Set form with data', movements);
    const fa: UntypedFormArray = this.fb.array([]);
    movements?.forEach((move: WorkflowMoveDTO) => fa.push(this.createMovementFormGroup(move)));
    const form = this.fb.group({
      movements: fa
    });
    this.editSubstateAuxService.setFormGroupByTab(form, this.tabId);
    this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
    console.log(this.form, this.form.value);
  }

  public saveData(): void {}

  public getData(): Observable<WorkflowMoveDTO[]> {
    return this.substatesService.getWorkflowSubstateMovements(this.workflowId, this.substate.id).pipe(take(1));
  }

  public nodeSelected(node: WorkflowSubstateDTO): void {
    const wfMovement: WorkflowMoveDTO = {
      id: null,
      orderNumber: (this.form.get('movements') as UntypedFormArray).length,
      requiredFields: false,
      requiredFieldsList: [],
      requiredHistoryComment: false,
      requiredMyself: false,
      requiredSize: false,
      requiredUser: false,
      roles: this.workflowRoles,
      sendMail: false,
      sendMailAuto: false,
      sendMailReceiverRole: null,
      sendMailReceiverType: null,
      shortcut: false,
      shortcutColor: null,
      shortcutName: null,
      signDocument: false,
      workflowSubstateSource: {
        ...this.substate
      },
      workflowSubstateTarget: {
        ...node
      },
      workflowSubstateTargetExtra: null,
      movementExtraAuto: false,
      movementExtraConfirm: false,
      requiredMovementExtra: false,
      sendMailTemplate: null,
      signDocumentTemplate: null
    };
    this.trigger.closeMenu();
    const spinner = this.spinnerService.show();
    this.substatesService
      .postWorkflowSubstateMovements(this.workflowId, this.substate.id, wfMovement)
      .pipe(take(1))
      .subscribe(
        (res) => {
          this.getData()
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe((data) => {
              this.dataToInitForm = data;
              this.initForm(this.dataToInitForm);
            });
        },
        (error) => {
          this.spinnerService.hide(spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }

  private createMovementFormGroup(move?: WorkflowMoveDTO): UntypedFormGroup {
    return this.fb.group({
      id: [move?.id ? move.id : null, [Validators.required]],
      orderNumber: [move?.orderNumber ? move.orderNumber : 0, [Validators.required]],
      requiredFields: [move?.requiredFields ? move.requiredFields : false],
      requiredFieldsList: [move?.requiredFieldsList ? move.requiredFieldsList : []],
      requiredHistoryComment: [move?.requiredHistoryComment ? move.requiredHistoryComment : false],
      requiredMyself: [move?.requiredMyself ? move.requiredMyself : false],
      requiredSize: [move?.requiredSize ? move.requiredSize : false],
      requiredUser: [move?.requiredUser ? move.requiredUser : false],
      roles: [move?.roles ? move.roles : []],
      sendMail: [move?.sendMail ? move.sendMail : false],
      sendMailAuto: [move?.sendMailAuto ? move.sendMailAuto : false],
      sendMailReceiverRole: [move?.sendMailReceiverRole ? move.sendMailReceiverRole : null],
      sendMailReceiverType: [move?.sendMailReceiverType ? move.sendMailReceiverType : null],
      shortcut: [move?.shortcut ? move.shortcut : false],
      shortcutColor: [move?.shortcutColor ? move.shortcutColor : null],
      shortcutName: [move?.shortcutName ? move.shortcutName : null],
      signDocument: [move?.signDocument ? move.signDocument : false],
      workflowSubstateSource: [move?.workflowSubstateSource ? move.workflowSubstateSource : null, [Validators.required]],
      workflowSubstateTarget: [move?.workflowSubstateTarget ? move.workflowSubstateTarget : null, [Validators.required]],
      workflowSubstateTargetExtra: [move?.workflowSubstateTargetExtra ? move.workflowSubstateTargetExtra : null],
      movementExtraAuto: [move?.movementExtraAuto ? move.movementExtraAuto : false],
      movementExtraConfirm: [move?.movementExtraConfirm ? move.movementExtraConfirm : false],
      requiredMovementExtra: [move?.requiredMovementExtra ? move.requiredMovementExtra : false]
    });
  }

  private fetchAllStatesSubstatesAndRoles(): void {
    const spinner = this.spinnerService.show();
    const resquests = [
      this.workflowService.getWorkflowRoles(this.workflowId).pipe(take(1)),
      this.substatesService.getAllStatesAndSubstates().pipe(take(1))
    ];
    forkJoin(resquests)
      .pipe(finalize(() => this.spinnerService.hide(spinner)))
      .subscribe(
        (responses: [WorkflowRoleDTO[], WorkflowStateDTO[]]) => {
          this.workflowRoles = responses[0].filter((role: WorkflowRoleDTO) => role.selected);
          this.allStatesAndSubstates = [];
          if (responses[1]?.length) {
            this.allStatesAndSubstates = this.createTree(responses[1]);
          }
        },
        (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }

  private createTree(data: WorkflowStateDTO[]): TreeNode[] {
    const treeNode: TreeNode[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherWorkflows: any = {};
    const workflowsIdsFound: number[] = [];
    data.forEach((state: WorkflowStateDTO) => {
      if (state.id === this.state.id && this.state.workflowSubstates.length === 1) {
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
                  .filter((wfSubs: WorkflowSubstateDTO) => wfSubs.id !== this.substate.id)
                  .map((wfSubs: WorkflowSubstateDTO) => ({
                    ...wfSubs,
                    workflowState: { ...state, children: [], workflowSubstates: [] }
                  }))
              ]
            }
          ]
        };
        if (state.workflow.id === this.workflowId) {
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
              .filter((wfSubs: WorkflowSubstateDTO) => wfSubs.id !== this.substate.id)
              .map((wfSubs: WorkflowSubstateDTO) => ({
                ...wfSubs,
                workflowState: { ...state, children: [], workflowSubstates: [] }
              }))
          ]
        };
        if (state.workflow.id === this.workflowId) {
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
    console.log(treeNode);
    return treeNode;
  }
}
