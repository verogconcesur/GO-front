import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowEventMailDTO from '@data/models/workflows/workflow-event-mail-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import {
  WfEditSubstateEventsComponentModalEnum,
  WfEditSubstateEventsDialogComponent
} from '../../../wf-edit-substate-events-dialog/wf-edit-substate-events-dialog.component';
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
    addMovement: marker('workflows.addMovement'),
    newTaskTooltip: marker('workflows.movementCreateNewTask'),
    configMovements: marker('workflows.configMovementEvents'),
    requiredMovementExtraDescription: marker('workflows.requiredMovementExtraDescription')
  };
  public substateMovements: WorkflowMoveDTO[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public chipsStatus: any = {};

  constructor(
    private fb: FormBuilder,
    public editSubstateAuxService: WEditSubstateFormAuxService,
    private substatesService: WorkflowAdministrationStatesSubstatesService,
    public spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService
  ) {
    super(editSubstateAuxService, spinnerService);
  }

  get movementsFa(): UntypedFormArray {
    return this.form.get('movements') as UntypedFormArray;
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  public initForm(movements: WorkflowMoveDTO[]): void {
    const fa: UntypedFormArray = this.fb.array([]);
    movements?.forEach((move: WorkflowMoveDTO) => fa.push(this.createMovementFormGroup(move)));
    const form = this.fb.group({
      movements: fa
    });
    this.editSubstateAuxService.setFormGroupByTab(form, this.tabId);
    this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
    // console.log(this.form, this.form.value);
  }

  public deleteMovement = (movefg: UntypedFormGroup) => {
    const spinner = this.spinnerService.show();
    this.substatesService
      .deleteWorkflowSubstateMovement(this.workflowId, this.substate.id, movefg.get('id').value)
      .pipe(take(1))
      .subscribe(
        (res) => {
          this.getDataAndInitForm(spinner);
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
  };

  public editMoveEvent = (movefg: UntypedFormGroup) => {
    this.customDialogService
      .open({
        component: WfEditSubstateEventsDialogComponent,
        extendedComponentData: {
          workflowId: this.workflowId,
          state: this.state,
          substate: this.substate,
          move: movefg.value,
          eventType: 'MOV'
        },
        id: WfEditSubstateEventsComponentModalEnum.ID,
        panelClass: WfEditSubstateEventsComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((data) => {
        if (data) {
          this.getDataAndInitForm(this.spinnerService.show());
        }
      });
  };

  public saveData(): void {}

  public getData(): Observable<WorkflowMoveDTO[]> {
    return this.substatesService.getWorkflowSubstateMovements(this.workflowId, this.substate.id).pipe(take(1));
  }

  public getDataAndInitForm(spinner?: string): void {
    this.getData()
      .pipe(
        take(1),
        finalize(() => {
          if (spinner) {
            this.spinnerService.hide(spinner);
          }
        })
      )
      .subscribe((data) => {
        this.dataToInitForm = data;
        this.initForm(this.dataToInitForm);
      });
  }

  public isTargetSameWorkflow(move: WorkflowSubstateDTO): boolean {
    return move.workflowState?.workflow?.id === this.workflowId;
  }

  public isChipSelected(chip: 'wf' | 'wf2' | 'info', id: number): boolean {
    if (!this.chipsStatus[id] && chip === 'wf') {
      return true;
    } else if (this.chipsStatus[id] === chip) {
      return true;
    }
    return false;
  }

  public changeChipSelection(chip: 'wf' | 'wf2' | 'info', id: number) {
    this.chipsStatus[id] = chip;
  }

  public getMovementName(move: WorkflowSubstateDTO): string {
    let name = '';
    if (move?.workflowState?.name) {
      name += `${move.workflowState.name} / `;
    }
    name += `${move.name}`;
    return name;
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
      roles: this.editSubstateAuxService.workflowRoles,
      sendMail: false,
      workflowEventMails: [],
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
      signDocumentTemplate: null
    };
    this.trigger.closeMenu();
    const spinner = this.spinnerService.show();
    this.substatesService
      .postWorkflowSubstateMovements(this.workflowId, this.substate.id, wfMovement)
      .pipe(take(1))
      .subscribe(
        (res) => {
          this.getDataAndInitForm(spinner);
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
      workflowEventMails: move?.workflowEventMails?.length
        ? this.fb.array(
            move.workflowEventMails.map((wem: WorkflowEventMailDTO) =>
              this.fb.group({
                id: [wem.id ? wem.id : null],
                sendMailAuto: [wem.sendMailAuto ? wem.sendMailAuto : false],
                sendMailTemplate: [wem?.sendMailTemplate ? wem.sendMailTemplate : null]
              })
            )
          )
        : this.fb.array([]),
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
}
