import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowEventMailDTO from '@data/models/workflows/workflow-event-mail-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { SortService } from '@shared/services/sort.service';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';
import { NGXLogger } from 'ngx-logger';
import { Observable, forkJoin } from 'rxjs';
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
    requiredMovementExtraDescription: marker('workflows.requiredMovementExtraDescription'),
    others: marker('workflows.withoutGroup')
  };
  public substateMovements: WorkflowMoveDTO[];
  public groupNames: string[] = [];
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
    private customDialogService: CustomDialogService,
    private sortService: SortService,
    private confirmationDialog: ConfirmDialogService
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
    this.groupNames = [];
    movements?.forEach((move: WorkflowMoveDTO) => {
      if (move?.groupName && this.groupNames.indexOf(move.groupName) === -1) {
        this.groupNames.push(move.groupName);
      }
      fa.push(this.createMovementFormGroup(move));
      console.log(this.form);
    });
    this.groupNames = this.groupNames.sort(this.sortService.alphaNumericSort);
    const form = this.fb.group({
      movements: fa
    });
    this.editSubstateAuxService.setFormGroupByTab(form, this.tabId);
    this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
  }

  public getGroupNames() {
    return [...this.groupNames, null];
  }

  public getMovementsByGroup(groupName: string): UntypedFormControl[] {
    if (groupName) {
      return this.movementsFa?.controls
        .filter((control: UntypedFormControl) => control.get('groupName').value === groupName)
        .sort((a, b) => a.get('orderNumber').value - b.get('orderNumber').value) as UntypedFormControl[];
    } else {
      return this.movementsFa?.controls
        .filter((control: UntypedFormControl) => !control.get('groupName').value)
        .sort((a, b) => a.get('orderNumber').value - b.get('orderNumber').value) as UntypedFormControl[];
    }
  }

  public drop(event: CdkDragDrop<string[]>, group: string) {
    const movementsFc = this.getMovementsByGroup(group);
    const startIndex = event.previousIndex;
    const endIndex = event.currentIndex;
    const movedItem = movementsFc[startIndex];
    const movementsToSave: WorkflowMoveDTO[] = [];
    const requests: Observable<WorkflowMoveDTO>[] = [];
    if (startIndex !== endIndex) {
      if (startIndex > endIndex) {
        for (let i = endIndex; i <= startIndex; i++) {
          if (movementsFc[i].get('orderNumber').value !== i + 1) {
            movementsFc[i].get('orderNumber').setValue(i + 1);
            movementsToSave.push(movementsFc[i].value);
          }
        }
      } else {
        for (let i = startIndex; i <= endIndex; i++) {
          if (movementsFc[i].get('orderNumber').value !== i) {
            movementsFc[i].get('orderNumber').setValue(i);
            movementsToSave.push(movementsFc[i].value);
          }
        }
      }
      movedItem.get('orderNumber').setValue(endIndex);
      movementsToSave.push(movedItem.value);
      movementsToSave.forEach((move: WorkflowMoveDTO) => {
        requests.push(this.substatesService.postWorkflowSubstateMovements(this.workflowId, this.substate.id, move));
      });
      if (requests.length > 0) {
        const spinner = this.spinnerService.show();
        forkJoin(requests)
          .pipe(take(1))
          .subscribe((res) => {
            this.getDataAndInitForm(spinner);
          });
      }
    }
  }

  public deleteMovement = (movefg: UntypedFormGroup) => {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
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
        }
      });
  };

  public editMoveEvent = (movefg: UntypedFormGroup) => {
    console.log(movefg);
    this.customDialogService
      .open({
        component: WfEditSubstateEventsDialogComponent,
        extendedComponentData: {
          workflowId: this.workflowId,
          state: this.state,
          substate: this.substate,
          move: movefg.value,
          groupNames: this.groupNames,
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
      webservice: false,
      workflowEventWebserviceConfig: null,
      roles: this.editSubstateAuxService.workflowRoles,
      sendMail: false,
      workflowEventMails: [],
      workflowEventConditionsReqFields: [],
      shortcut: false,
      shortcutColor: null,
      shortcutName: null,
      groupName: null,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initAttachmentsArray(attachments: any[]): FormArray {
    return this.fb.array(attachments.map((attachment) => this.initAttachmentGroup(attachment)));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initAttachmentGroup(attachment: any): FormGroup {
    return this.fb.group({
      id: [attachment.id || null],
      workflowMovement: [attachment.workflowMovement || null],
      tab: [attachment.tab || null],
      templateAttachmentItem: [attachment.templateAttachmentItem || null],
      numMinAttachRequired: [attachment.numMinAttachRequired || null],
      workflowEventCondition: [attachment.workflowEventCondition || null]
    });
  }

  private createMovementFormGroup(move?: WorkflowMoveDTO): UntypedFormGroup {
    return this.fb.group({
      id: [move?.id ? move.id : null, [Validators.required]],
      orderNumber: [move?.orderNumber ? move.orderNumber : 0, [Validators.required]],
      requiredFields: [move?.requiredFields ? move.requiredFields : false],
      workflowEventConditionsReqFields: [move?.workflowEventConditionsReqFields ? move.workflowEventConditionsReqFields : null],
      requiredAttachments: [move?.requiredAttachments ? true : false],
      requiredFieldsList: [move?.requiredFieldsList ? move.requiredFieldsList : []],
      requiredHistoryComment: [move?.requiredHistoryComment ? move.requiredHistoryComment : false],
      requiredMyself: [move?.requiredMyself ? move.requiredMyself : false],
      requiredMyselfCriteriaConditions: [move?.requiredMyselfCriteriaConditions ? move.requiredMyselfCriteriaConditions : []],
      requiredSize: [move?.requiredSize ? move.requiredSize : false],
      requiredSizeCriteriaConditions: [move?.requiredSizeCriteriaConditions ? move.requiredSizeCriteriaConditions : []],
      requiredUser: [move?.requiredUser ? move.requiredUser : false],
      requiredUserCriteriaConditions: [move?.requiredUserCriteriaConditions ? move.requiredUserCriteriaConditions : []],
      webservice: [move?.webservice ? move.webservice : false],
      workflowEventConditions: [move?.workflowEventConditions ? move.workflowEventConditions : []],
      webserviceCriteriaConditions: [move?.webserviceCriteriaConditions ? move.webserviceCriteriaConditions : []],
      workflowSubstateEventRequiredAttachments: this.initAttachmentsArray(move?.workflowMovementRequiredAttachments || []),
      workflowEventWebserviceConfig: this.fb.group(
        {
          authAttributeToken: [
            move?.workflowEventWebserviceConfig?.authAttributeToken ? move.workflowEventWebserviceConfig.authAttributeToken : null
          ],
          authPass: [move?.workflowEventWebserviceConfig?.authPass ? move.workflowEventWebserviceConfig.authPass : null],
          authUrl: [move?.workflowEventWebserviceConfig?.authUrl ? move.workflowEventWebserviceConfig.authUrl : null],
          authUser: [move?.workflowEventWebserviceConfig?.authUser ? move.workflowEventWebserviceConfig.authUser : null],
          blocker: [move?.workflowEventWebserviceConfig?.blocker ? move.workflowEventWebserviceConfig.blocker : false],
          body: [move?.workflowEventWebserviceConfig?.body ? move.workflowEventWebserviceConfig.body : null],
          id: [move?.workflowEventWebserviceConfig?.id ? move.workflowEventWebserviceConfig.id : null],
          method: [
            move?.workflowEventWebserviceConfig?.method ? move.workflowEventWebserviceConfig.method : 'GET',
            [Validators.required]
          ],
          requireAuth: [
            move?.workflowEventWebserviceConfig?.requireAuth ? move.workflowEventWebserviceConfig.requireAuth : false
          ],
          variables: [move?.workflowEventWebserviceConfig?.variables ? move.workflowEventWebserviceConfig.variables : []],
          webserviceUrl: [
            move?.workflowEventWebserviceConfig?.webserviceUrl ? move.workflowEventWebserviceConfig.webserviceUrl : null,
            [Validators.required]
          ]
        },
        {
          validators: [
            CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('body', [
              { control: 'method', operation: 'equal', value: 'POST' }
            ]),
            CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authUrl', [
              { control: 'requireAuth', operation: 'equal', value: true }
            ]),
            CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authUser', [
              { control: 'requireAuth', operation: 'equal', value: true }
            ]),
            CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authPass', [
              { control: 'requireAuth', operation: 'equal', value: true }
            ]),
            CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authAttributeToken', [
              { control: 'requireAuth', operation: 'equal', value: true }
            ])
          ]
        }
      ),
      roles: [move?.roles ? move.roles : []],
      sendMail: [move?.sendMail ? move.sendMail : false],
      workflowEventMails: move?.workflowEventMails?.length
        ? this.fb.array(
            move.workflowEventMails.map((wem: WorkflowEventMailDTO) =>
              this.fb.group({
                id: [wem.id ? wem.id : null],
                sendMailAuto: [wem.sendMailAuto ? wem.sendMailAuto : false],
                sendMailTemplate: [wem?.sendMailTemplate ? wem.sendMailTemplate : null],
                workflowEventMailReceivers: [wem?.workflowEventMailReceivers ? wem.workflowEventMailReceivers : []],
                workflowEventCondition: [wem?.workflowEventCondition ? wem.workflowEventCondition : null]
              })
            )
          )
        : this.fb.array([]),
      shortcut: [move?.shortcut ? move.shortcut : false],
      shortcutColor: [move?.shortcutColor ? move.shortcutColor : null],
      shortcutName: [move?.shortcutName ? move.shortcutName : null],
      groupName: [move?.groupName ? move.groupName : null],
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
