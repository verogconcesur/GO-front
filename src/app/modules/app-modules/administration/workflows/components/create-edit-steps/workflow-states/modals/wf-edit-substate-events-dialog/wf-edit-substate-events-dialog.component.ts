import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TreeNode from '@data/interfaces/tree-node';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { WEditSubstateFormAuxService } from '../wf-edit-substate-dialog/aux-service/wf-edit-substate-aux.service';
export const enum WfEditSubstateEventsComponentModalEnum {
  ID = 'edit-state-dialog-id',
  PANEL_CLASS = 'edit-state-dialog',
  TITLE = 'workflows.editState'
}

@Component({
  selector: 'app-wf-edit-substate-events-dialog',
  templateUrl: './wf-edit-substate-events-dialog.component.html',
  styleUrls: ['./wf-edit-substate-events-dialog.component.scss']
})
export class WfEditSubstateEventsDialogComponent extends ComponentToExtendForCustomDialog implements OnInit, OnChanges {
  @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  @Input() extendedComponentData: {
    state: WorkflowStateDTO;
    substate: WorkflowSubstateDTO;
    move: WorkflowMoveDTO;
    eventType: 'IN' | 'OUT' | 'MOV';
    workflowId: number;
    allStatesAndSubstates: TreeNode[];
    roles?: WorkflowRoleDTO[];
  };
  @Output() formIntialized: EventEmitter<boolean> = new EventEmitter();
  public labels = {
    whoSeeThisMovement: marker('workflows.whoSeeThisMovement'),
    roles: marker('common.roles'),
    role: marker('common.role'),
    all: marker('common.all'),
    events: marker('common.events'),
    sendMail: marker('workflows.sendMail'),
    sendMailAuto: marker('workflows.sendMailAuto'),
    sendMailTemplate: marker('workflows.sendMailTemplate'),
    sendMailReceiverType: marker('workflows.sendMailReceiverType'),
    sendMailReceiverRole: marker('workflows.sendMailReceiverRole'),
    client: marker('common.client'),
    user: marker('common.user'),
    required: marker('errors.required'),
    requiredSize: marker('workflows.requiredSize'),
    requiredUser: marker('workflows.requiredUser'),
    requiredMyself: marker('workflows.requiredMyself'),
    requiredFields: marker('workflows.requiredFields'),
    requiredFieldsList: marker('workflows.requiredFieldsList'),
    historical: marker('workflows.historical'),
    requiredHistoryComment: marker('workflows.requiredHistoryComment'),
    shortcut: marker('common.directLinks'),
    shortcutDescription: marker('workflows.shortcutDescription'),
    shortcutColor: marker('workflows.shortcutColor'),
    shortcutName: marker('workflows.shortcutName'),
    extraMovement: marker('workflows.extraMovement'),
    requiredMovementExtraDescription: marker('workflows.requiredMovementExtraDescription'),
    movementExtraAutoDescription: marker('workflows.movementExtraAutoDescription'),
    workflowSubstateTargetExtra: marker('workflows.workflowSubstateTargetExtra')
  };
  public form: UntypedFormGroup;
  public state: WorkflowStateDTO;
  public substate: WorkflowSubstateDTO;
  public move: WorkflowMoveDTO;
  public eventType: 'IN' | 'OUT' | 'MOV';
  public workflowId: number;
  public roles: WorkflowRoleDTO[];
  public templatesList: TemplatesCommonDTO[];
  public fieldsList: CardColumnTabItemDTO[];
  public allStatesAndSubstates: TreeNode[];

  constructor(
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    public editSubstateAuxService: WEditSubstateFormAuxService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private wStatesService: WorkflowAdministrationStatesSubstatesService,
    private globalMessageService: GlobalMessageService,
    private cardService: CardService,
    private workflowService: WorkflowAdministrationService
  ) {
    super(
      WfEditSubstateEventsComponentModalEnum.ID,
      WfEditSubstateEventsComponentModalEnum.PANEL_CLASS,
      marker('workflows.configMoveEvent')
    );
  }

  async ngOnInit(): Promise<void> {
    const spinner = this.spinnerService.show();
    this.getInfoFromExtendedComponentData(true);
    await this.getTemplatesAndFields();
    if (this.move) {
      this.initForm(this.move);
    }
    this.spinnerService.hide(spinner);
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.extendedComponentData) {
      if (!this.fieldsList || !this.templatesList) {
        const spinner = this.spinnerService.show();
        await this.getTemplatesAndFields();
        this.spinnerService.hide(spinner);
      }
      this.getInfoFromExtendedComponentData();
    }
  }

  public getInfoFromExtendedComponentData(avoidInitFrom?: boolean): void {
    this.state = this.extendedComponentData?.state;
    this.substate = this.extendedComponentData?.substate;
    this.workflowId = this.extendedComponentData?.workflowId;
    this.move = this.extendedComponentData?.move;
    this.eventType = this.extendedComponentData?.eventType;
    this.allStatesAndSubstates = this.editSubstateAuxService.allStatesAndSubstates[0].children;
    this.roles = this.editSubstateAuxService.workflowRoles;
    if (!avoidInitFrom) {
      this.initForm(this.move);
    }
  }

  public getMoveEventDetail(type: 'from' | 'to'): string {
    const wfSubstate: WorkflowSubstateDTO = type === 'from' ? this.move.workflowSubstateSource : this.move.workflowSubstateTarget;
    let detail = '';
    if (!this.isTargetAndSourceSameWorkflow()) {
      detail = `${wfSubstate.workflowState.workflow.name} / `;
    }
    detail += `${wfSubstate.workflowState.name} / ${wfSubstate.name}`;
    return detail;
  }

  public isTargetAndSourceSameWorkflow(): boolean {
    return (
      this.move?.workflowSubstateSource?.workflowState?.workflow?.id &&
      this.move?.workflowSubstateTarget?.workflowState?.workflow?.id &&
      this.move?.workflowSubstateSource?.workflowState?.workflow?.id ===
        this.move?.workflowSubstateTarget?.workflowState?.workflow?.id
    );
  }

  public nodeSelected(node: WorkflowSubstateDTO): void {
    this.form.get('workflowSubstateTargetExtra').setValue(node);
    this.form.get('workflowSubstateTargetExtra').markAsDirty();
    this.form.get('workflowSubstateTargetExtra').markAsTouched();
    this.trigger.closeMenu();
  }

  public initForm(data: WorkflowMoveDTO): void {
    let typeMoveExtra = {};
    let validatorsExtra: ValidatorFn[] = [];
    if (this.eventType === 'MOV') {
      //Parte del formulario específica para los eventos de tipo mov
      let extraMovement = {};
      if (this.move?.workflowSubstateSource && this.move?.workflowSubstateTarget && !this.isTargetAndSourceSameWorkflow()) {
        extraMovement = {
          requiredMovementExtra: [data?.requiredMovementExtra ? true : false],
          movementExtraAuto: [data?.movementExtraAuto ? true : false],
          workflowSubstateTargetExtra: [data?.workflowSubstateTargetExtra ? data.workflowSubstateTargetExtra : null]
        };
        validatorsExtra = [
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('workflowSubstateTargetExtra', [
            { control: 'requiredMovementExtra', operation: 'equal', value: true }
          ])
        ];
      }
      typeMoveExtra = {
        roles: [
          data?.roles
            ? this.roles.map((role: WorkflowRoleDTO) => {
                if (data.roles && data.roles.find((drole: RoleDTO) => drole.id === role.id)) {
                  return { ...role, selected: true };
                }
                return { ...role, selected: false };
              })
            : this.roles
        ],
        //Acceso directo
        shortcut: [data?.shortcut ? true : false],
        shortcutColor: [data?.shortcutColor ? data.shortcutColor : '#FFFFFF'],
        shortcutName: [data?.shortcutName ? data.shortcutName : null],
        ...extraMovement
      };
      validatorsExtra = [
        ...validatorsExtra,
        CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('shortcutColor', [
          { control: 'shortcut', operation: 'equal', value: true }
        ]),
        CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('shortcutName', [
          { control: 'shortcut', operation: 'equal', value: true }
        ])
      ];
    }
    // console.log(data, this.templatesList);
    this.form = this.fb.group(
      {
        //Mandar email
        sendMail: [data?.sendMail ? true : false],
        sendMailAuto: [data?.sendMailAuto ? true : false],
        sendMailReceiverRole: [
          data?.sendMailReceiverRole ? this.roles.find((role) => role.id === data.sendMailReceiverRole.id) : null
        ],
        sendMailReceiverType: [data?.sendMailReceiverType ? data.sendMailReceiverType : null],
        sendMailTemplate: [
          data?.sendMailTemplate ? this.templatesList.find((template) => template.id === data.sendMailTemplate.id) : null
        ],
        //Asignar peso a la ficha
        requiredSize: [data?.requiredSize ? true : false],
        //Asignar usuario - excluyente
        //Autoasignar usuario - excluyente
        requiredUser: [data?.requiredUser ? data.requiredUser : false],
        requiredMyself: [data?.requiredMyself ? data.requiredMyself : false],
        //Rellenar campo
        requiredFields: [data?.requiredFields ? true : false],
        requiredFieldsList: [
          data?.requiredFieldsList && this.fieldsList
            ? this.fieldsList.filter((field) => data.requiredFieldsList.find((f) => f.id === field.id))
            : []
        ],
        //Comentario para el historial
        requiredHistoryComment: [data?.requiredHistoryComment ? true : false],
        ...typeMoveExtra
      },
      {
        validators: [
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions(
            'sendMailReceiverRole',
            [{ control: 'sendMailReceiverType', operation: 'equal', value: 'USER' }],
            [{ control: 'sendMail', operation: 'equal', value: true }]
          ),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('sendMailReceiverType', [
            { control: 'sendMail', operation: 'equal', value: true }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('sendMailTemplate', [
            { control: 'sendMail', operation: 'equal', value: true }
          ]),
          CombinedRequiredFieldsValidator.field1ExclusiveIfField2Condition('requiredMyself', {
            control: 'requiredUser',
            operation: 'equal',
            value: true
          }),
          CombinedRequiredFieldsValidator.field1ExclusiveIfField2Condition('requiredUser', {
            control: 'requiredMyself',
            operation: 'equal',
            value: true
          }),
          ...validatorsExtra
        ]
      }
    );
    this.formIntialized.emit(true);
    // console.log(this.form, this.form.value);
  }

  public allRolesSelected(): boolean {
    return this.form.get('roles')?.value.reduce((prev: boolean, curr: RoleDTO) => {
      if (prev && !curr.selected) {
        prev = false;
      }
      return prev;
    }, true);
  }

  public someRolesSelected(): boolean {
    return (
      !this.allRolesSelected() &&
      this.form.get('roles')?.value.reduce((prev: boolean, curr: RoleDTO) => {
        if (curr.selected) {
          prev = true;
        }
        return prev;
      }, false)
    );
  }

  public setAllRoles(selected: boolean): void {
    this.form.get('roles').setValue(
      this.form.get('roles').value.map((role: RoleDTO) => ({
        ...role,
        selected
      }))
    );
    this.form.get('roles').markAsDirty();
    this.form.get('roles').markAsTouched();
  }

  public changeRoleValue(roleToChange: RoleDTO): void {
    this.form.get('roles').setValue(
      this.form.get('roles').value.map((role: RoleDTO) => {
        if (role.id === roleToChange.id) {
          return { ...role, selected: !role.selected };
        } else {
          return role;
        }
      })
    );
    this.form.get('roles').markAsDirty();
    this.form.get('roles').markAsTouched();
  }

  public requiredUserChange(value: 'myself' | 'user'): void {
    if (value === 'myself' && this.form.get('requiredMyself').value) {
      this.form.get('requiredUser').setValue(false);
    } else if (value === 'user' && this.form.get('requiredUser').value) {
      this.form.get('requiredMyself').setValue(false);
    }
  }

  public getWorkflowTagetName(): string {
    let name = '';
    const substateTarget: WorkflowSubstateDTO = this.form?.get('workflowSubstateTargetExtra')?.value;
    if (substateTarget) {
      name = `${substateTarget.workflowState.workflow.name} - ${substateTarget.workflowState.name} - ${substateTarget.name}`;
    }
    return name;
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.form.touched && this.form.dirty) {
      return this.confirmDialogService
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('common.unsavedChangesExit'))
        })
        .pipe(take(1));
    }
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean> {
    const formValue = {
      ...this.form.value,
      requiredFieldsList: this.form.value.requiredFields ? this.form.value.requiredFieldsList : []
    };
    const spinner = this.spinnerService.show();
    if (this.eventType === 'MOV') {
      return this.wStatesService
        .postWorkflowSubstateMovements(this.workflowId, this.substate.id, { ...this.move, ...formValue })
        .pipe(
          take(1),
          map((response) => {
            this.globalMessageService.showSuccess({
              message: this.translateService.instant(marker('common.successOperation')),
              actionText: this.translateService.instant(marker('common.close'))
            });
            return true;
          }),
          catchError((error) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            return of(false);
          }),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        );
    }
    return of(false);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.cancel'),
          design: 'flat'
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.form?.touched && this.form?.dirty && this.form?.valid)
        }
      ]
    };
  }

  private async getTemplatesAndFields(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.workflowId) {
        resolve(false);
        return;
      }
      const requests = [
        this.workflowService.getWorkflowViewAttributes(this.workflowId).pipe(take(1)),
        this.cardService.listTemplates('COMUNICATION').pipe(take(1))
      ];
      forkJoin(requests).subscribe((responses: [cards: CardColumnDTO[], templates: TemplatesCommonDTO[]]) => {
        const fieldList: CardColumnTabItemDTO[] = [];
        responses[0].forEach((cardCol: CardColumnDTO) => {
          cardCol.tabs.forEach((tab: CardColumnTabDTO) => {
            tab.tabItems.forEach((tabItem: CardColumnTabItemDTO) => {
              fieldList.push({ ...tabItem, name: `${cardCol.name} - ${tab.name} - ${tabItem.name}` });
            });
          });
        });
        this.fieldsList = fieldList;
        this.templatesList = responses[1];
        resolve(true);
      });
    });
  }
}
