/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TreeNode from '@data/interfaces/tree-node';
import AdvSearchOperatorDTO from '@data/models/adv-search/adv-search-operator-dto';
import AdvancedSearchOptionsDTO from '@data/models/adv-search/adv-search-options-dto';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import VariablesDTO from '@data/models/variables-dto';
import { WorkflowAttachmentTimelineDTO } from '@data/models/workflow-admin/workflow-attachment-timeline-dto';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import WorkflowEventMailDTO, { WorkflowEventMailReceiverDTO } from '@data/models/workflows/workflow-event-mail-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { AdvSearchService } from '@data/services/adv-search.service';
import { CardService } from '@data/services/cards.service';
import { VariablesService } from '@data/services/variables.service';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import {
  LinksCreationEditionDialogComponent,
  LinksCreationEditionDialogComponentModalEnum
} from '@modules/feature-modules/modal-links-creation-edition/links-creation-edition-dialog.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';
import { WebserviceUrlValidator } from '@shared/validators/web-service.validator';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { WorkflowsEventsConditionsAuxService } from '../../components/wf-events-conditions/wf-events-conditions-aux.service';
import { WEditSubstateFormAuxService } from '../wf-edit-substate-dialog/aux-service/wf-edit-substate-aux.service';
export const enum WfEditSubstateEventsComponentModalEnum {
  ID = 'edit-state-dialog-id',
  PANEL_CLASS = 'edit-state-dialog',
  TITLE = 'workflows.editState'
}

@UntilDestroy()
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
    groupNames?: string[];
    roles?: WorkflowRoleDTO[];
  };
  @Output() formIntialized: EventEmitter<boolean> = new EventEmitter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public labels: any = {
    whoSeeThisMovement: marker('workflows.whoSeeThisMovement'),
    roles: marker('common.roles'),
    role: marker('common.role'),
    all: marker('common.all'),
    events: marker('common.events'),
    emails: marker('common.emails'),
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
    requiredAttachment: marker('workflows.requiredAttachment'),
    requiredFieldsList: marker('workflows.requiredFieldsList'),
    requiredAttachmentsList: marker('workflows.requiredAttachmentsList'),
    historical: marker('workflows.historical'),
    requiredHistoryComment: marker('workflows.requiredHistoryComment'),
    shortcut: marker('common.directLinks'),
    shortcutDescription: marker('workflows.shortcutDescription'),
    shortcutColor: marker('workflows.shortcutColor'),
    shortcutName: marker('workflows.shortcutName'),
    extraMovement: marker('workflows.extraMovement'),
    requiredMovementExtraDescription: marker('workflows.requiredMovementExtraDescription'),
    movementExtraAutoDescription: marker('workflows.movementExtraAutoDescription'),
    workflowSubstateTargetExtra: marker('workflows.workflowSubstateTargetExtra'),
    CLIENT: marker('workflows.receiver.client'),
    ADVISER: marker('workflows.receiver.adviser'),
    ASIGNED: marker('workflows.receiver.asigned'),
    FOLLOWERS: marker('workflows.receiver.followers'),
    ROLE: marker('workflows.receiver.role'),
    OTHER: marker('workflows.receiver.other'),
    errorPatternMessage: marker('errors.emailPattern'),
    movementGroup: marker('workflows.movementGroup'),
    groupName: marker('workflows.groupName'),
    webservice: marker('workflows.webservice')
  };
  public receiverTypes = ['CLIENT', 'ADVISER', 'ASIGNED', 'FOLLOWERS', 'ROLE', 'OTHER'];
  public form: UntypedFormGroup;
  public state: WorkflowStateDTO;
  public substate: WorkflowSubstateDTO;
  public move: WorkflowMoveDTO;
  public eventType: 'IN' | 'OUT' | 'MOV';
  public workflowId: number;
  public roles: WorkflowRoleDTO[];
  public templatesList: TemplatesCommonDTO[];
  public fieldsList: CardColumnTabItemDTO[];
  public attachmentList: WorkflowAttachmentTimelineDTO[];
  public linksList: CardColumnTabItemDTO[];
  public allStatesAndSubstates: TreeNode[];
  public emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  public groupNames: string[] = [];
  public filteredGroupNames: Observable<string[]>;
  public listVariables: VariablesDTO[];
  public criteriaOptions: AdvancedSearchOptionsDTO = { cards: {}, entities: {} };
  public operators: AdvSearchOperatorDTO[] = [];
  public escapedValue = '';

  constructor(
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    public editSubstateAuxService: WEditSubstateFormAuxService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private wStatesService: WorkflowAdministrationStatesSubstatesService,
    private globalMessageService: GlobalMessageService,
    private cardService: CardService,
    private workflowService: WorkflowAdministrationService,
    private customDialogService: CustomDialogService,
    private variablesService: VariablesService,
    private administrationService: WorkflowAdministrationService,
    private wfEventsConditiosAuxService: WorkflowsEventsConditionsAuxService,
    private advSearchService: AdvSearchService
  ) {
    super(
      WfEditSubstateEventsComponentModalEnum.ID,
      WfEditSubstateEventsComponentModalEnum.PANEL_CLASS,
      marker('workflows.configMoveEvent')
    );
  }

  async ngOnInit(): Promise<void> {
    const spinner = this.spinnerService.show();
    this.getVariable();
    this.getInfoFromExtendedComponentData(true);
    await this.getTemplatesAndFields();
    await this.getCriteriaOptions();
    if (this.move) {
      this.initForm(this.move);
    }
    if (this.eventType === 'MOV') {
      this.filteredGroupNames = this.form.get('groupName').valueChanges.pipe(
        untilDestroyed(this),
        map((value: string) => {
          if (value) {
            const filterValue = value.toLowerCase();
            return this.groupNames?.length
              ? this.groupNames.filter((option: string) => option.toLowerCase().includes(filterValue))
              : [];
          } else {
            return this.groupNames?.length ? this.groupNames : [];
          }
        })
      );
    }
    this.spinnerService.hide(spinner);
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.extendedComponentData) {
      if (!this.attachmentList || !this.fieldsList || !this.templatesList) {
        const spinner = this.spinnerService.show();
        await this.getTemplatesAndFields();
        this.spinnerService.hide(spinner);
      }
      this.getInfoFromExtendedComponentData();
    }
  }

  public compareAttachments(o1: any, o2: any): boolean {
    if (o1 === null || o2 === null) {
      return false;
    }
    const result = o1.id === o2.id && o1.templateAttachmentItemId === o2.templateAttachmentItemId;
    return result;
  }

  public getInfoFromExtendedComponentData(avoidInitFrom?: boolean): void {
    this.state = this.extendedComponentData?.state;
    this.substate = this.extendedComponentData?.substate;
    this.workflowId = this.extendedComponentData?.workflowId;
    this.move = this.extendedComponentData?.move;
    this.eventType = this.extendedComponentData?.eventType;
    this.allStatesAndSubstates = this.editSubstateAuxService.allStatesAndSubstates[0].children;
    this.roles = this.editSubstateAuxService.workflowRoles;
    this.groupNames = this.extendedComponentData?.groupNames ? this.extendedComponentData?.groupNames : [];
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
  public compareFields(field1: any, field2: any): boolean {
    return field1 && field2 ? field1.id === field2.id : field1 === field2;
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
    const sizeCondition = data?.workflowEventConditions?.find((cond) => cond.workflowEventType === 'SIZE');
    const userCondition = data?.workflowEventConditions?.find((cond) => cond.workflowEventType === 'USER');
    const myselfCondition = data?.workflowEventConditions?.find((cond) => cond.workflowEventType === 'MYSELF');
    const webServiceCondition = data?.workflowEventConditions?.find((cond) => cond.workflowEventType === 'WEBSERVICE');
    let requiredSizeCriteriaConditionsGroup;
    let requiredUserCriteriaConditionsGroup;
    let requiredMyselfCriteriaConditionsGroup;
    let requiredWebServicefCriteriaConditionsGroup;
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
        groupName: [data?.groupName ? data.groupName : null],
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

    if (this.eventType === 'MOV') {
      requiredSizeCriteriaConditionsGroup = this.fb.group({
        id: [sizeCondition?.id ?? null],
        workflowEventType: ['SIZE'],
        workflowMovementId: [sizeCondition?.workflowMovementId ?? null],
        workflowEventConditionItems: [
          sizeCondition?.workflowEventConditionItems
            ? this.fb.array(
                sizeCondition.workflowEventConditionItems.map((cc, i) =>
                  this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i)
                )
              )
            : this.fb.array([])
        ]
      });
      requiredUserCriteriaConditionsGroup = this.fb.group({
        id: [userCondition?.id ?? null],
        workflowEventType: ['USER'],
        workflowMovementId: [userCondition?.workflowMovementId ?? null],
        workflowEventConditionItems: [
          userCondition?.workflowEventConditionItems
            ? this.fb.array(
                userCondition.workflowEventConditionItems.map((cc, i) =>
                  this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i)
                )
              )
            : this.fb.array([])
        ]
      });
      requiredMyselfCriteriaConditionsGroup = this.fb.group({
        id: [myselfCondition?.id ?? null],
        workflowEventType: ['MYSELF'],
        workflowMovementId: [myselfCondition?.workflowMovementId ?? null],
        workflowEventConditionItems: [
          myselfCondition?.workflowEventConditionItems
            ? this.fb.array(
                myselfCondition.workflowEventConditionItems.map((cc, i) =>
                  this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i)
                )
              )
            : this.fb.array([])
        ]
      });
      requiredWebServicefCriteriaConditionsGroup = this.fb.group({
        id: [webServiceCondition?.id ?? null],
        workflowEventType: ['WEBSERVICE'],
        workflowMovementId: [webServiceCondition?.workflowMovementId ?? null],
        workflowEventConditionItems: [
          webServiceCondition?.workflowEventConditionItems
            ? this.fb.array(
                webServiceCondition.workflowEventConditionItems.map((cc, i) =>
                  this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i)
                )
              )
            : this.fb.array([])
        ]
      });
      this.attachmentList = this.attachmentList?.map((attachment) => {
        const matchingBackendAttachment = this.move.workflowSubstateEventRequiredAttachments?.find(
          (f) => f.tab.id === attachment.id && f.templateAttachmentItem.id === attachment.templateAttachmentItemId
        );
        if (matchingBackendAttachment) {
          return {
            ...attachment,
            numberInput: matchingBackendAttachment.numMinAttachRequired,
            workflowEventCondition: {
              id: matchingBackendAttachment?.workflowEventCondition?.id,
              workflowEventType: matchingBackendAttachment?.workflowEventCondition?.workflowEventType,
              workflowEventConditionItems: matchingBackendAttachment?.workflowEventCondition?.workflowEventConditionItems,
              workflowMovementRequiredAttachmentId:
                matchingBackendAttachment?.workflowEventCondition?.workflowMovementRequiredAttachmentId,
              workflowSubstateEventRequiredAttachmentId:
                matchingBackendAttachment?.workflowEventCondition?.workflowSubstateEventRequiredAttachmentId
            }
          };
        }
        return attachment;
      });
    } else {
      requiredSizeCriteriaConditionsGroup = this.fb.group({
        id: [sizeCondition?.id ?? null],
        workflowEventType: ['SIZE'],
        workflowSubstateId: [sizeCondition?.workflowSubstateId ?? null],
        workflowEventConditionItems: [
          sizeCondition?.workflowEventConditionItems
            ? this.fb.array(
                sizeCondition.workflowEventConditionItems.map((cc, i) =>
                  this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i)
                )
              )
            : this.fb.array([])
        ]
      });
      requiredUserCriteriaConditionsGroup = this.fb.group({
        id: [userCondition?.id ?? null],
        workflowEventType: ['USER'],
        workflowSubstateId: [userCondition?.workflowMovementId ?? null],
        workflowEventConditionItems: [
          userCondition?.workflowEventConditionItems
            ? this.fb.array(
                userCondition.workflowEventConditionItems.map((cc, i) =>
                  this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i)
                )
              )
            : this.fb.array([])
        ]
      });
      requiredMyselfCriteriaConditionsGroup = this.fb.group({
        id: [myselfCondition?.id ?? null],
        workflowEventType: ['MYSELF'],
        workflowSubstateId: [myselfCondition?.workflowMovementId ?? null],
        workflowEventConditionItems: [
          myselfCondition?.workflowEventConditionItems
            ? this.fb.array(
                myselfCondition.workflowEventConditionItems.map((cc, i) =>
                  this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i)
                )
              )
            : this.fb.array([])
        ]
      });
      requiredWebServicefCriteriaConditionsGroup = this.fb.group({
        id: [webServiceCondition?.id ?? null],
        workflowEventType: ['WEBSERVICE'],
        workflowSubstateId: [webServiceCondition?.workflowMovementId ?? null],
        workflowEventConditionItems: [
          webServiceCondition?.workflowEventConditionItems
            ? this.fb.array(
                webServiceCondition.workflowEventConditionItems.map((cc, i) =>
                  this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i)
                )
              )
            : this.fb.array([])
        ]
      });
      this.attachmentList = this.attachmentList?.map((attachment) => {
        const matchingBackendAttachment = data.workflowSubstateEventRequiredAttachments?.find(
          (f) => f.tab.id === attachment.id && f.templateAttachmentItem.id === attachment.templateAttachmentItemId
        );
        if (matchingBackendAttachment) {
          return {
            ...attachment,
            numberInput: matchingBackendAttachment.numMinAttachRequired,
            workflowEventCondition: {
              id: matchingBackendAttachment.workflowEventCondition.id,
              workflowEventType: matchingBackendAttachment.workflowEventCondition.workflowEventType,
              workflowEventConditionItems: matchingBackendAttachment.workflowEventCondition.workflowEventConditionItems,
              workflowMovementRequiredAttachmentId:
                matchingBackendAttachment.workflowEventCondition.workflowMovementRequiredAttachmentId,
              workflowSubstateEventRequiredAttachmentId:
                matchingBackendAttachment?.workflowEventCondition?.workflowSubstateEventRequiredAttachmentId
            }
          };
        }
        return attachment;
      });
    }
    this.form = this.fb.group(
      {
        //Mandar email
        sendMail: [data?.sendMail ? true : false],
        workflowEventMails: data?.workflowEventMails?.length
          ? this.fb.array(
              data.workflowEventMails.map((wem: WorkflowEventMailDTO) =>
                this.fb.group({
                  id: [wem.id ? wem.id : null],
                  sendMailAuto: [wem.sendMailAuto ? wem.sendMailAuto : false],
                  sendMailTemplate: [
                    wem?.sendMailTemplate && this.templatesList
                      ? this.templatesList.find((template) => template.id === wem.sendMailTemplate.id)
                      : null
                  ],
                  receiverTypes: [
                    wem?.workflowEventMailReceivers?.length
                      ? wem.workflowEventMailReceivers.map((receiver: WorkflowEventMailReceiverDTO) => receiver.receiverType)
                      : []
                  ],
                  receiverEmails: [
                    wem?.workflowEventMailReceivers?.length
                      ? wem.workflowEventMailReceivers.reduce((prev: string[], curr: WorkflowEventMailReceiverDTO) => {
                          if (curr.receiverType === 'OTHER' && curr.emails) {
                            prev = [...prev, ...curr.emails.split(',')];
                          }
                          return prev;
                        }, [])
                      : []
                  ],
                  receiverRole: [
                    wem?.workflowEventMailReceivers?.length
                      ? wem.workflowEventMailReceivers.reduce((prev: RoleDTO, curr: WorkflowEventMailReceiverDTO) => {
                          if (curr.receiverType === 'ROLE' && curr.role) {
                            prev = this.roles.find((role: WorkflowRoleDTO) => role.id === curr.role.id);
                          }
                          return prev;
                        }, null)
                      : null
                  ],
                  workflowEventCondition: this.fb.group({
                    id: [wem?.workflowEventCondition?.id ?? null],
                    workflowEventType: ['EMAIL'],
                    workflowEventMailId: [wem?.workflowEventCondition?.workflowEventMailId ?? null],
                    workflowEventConditionItems: [
                      wem?.workflowEventCondition?.workflowEventConditionItems
                        ? this.fb.array(
                            wem.workflowEventCondition.workflowEventConditionItems.map((cc, index) =>
                              this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, index)
                            )
                          )
                        : this.fb.array([])
                    ]
                  })
                })
              )
            )
          : this.fb.array([]),
        //Asignar peso a la ficha
        requiredSize: [data?.requiredSize ? true : false],
        requiredSizeCriteriaConditions: requiredSizeCriteriaConditionsGroup,
        //Autoasignar usuario - excluyente
        requiredUser: [data?.requiredUser ? data.requiredUser : false],
        requiredUserCriteriaConditions: requiredUserCriteriaConditionsGroup,
        requiredMyself: [data?.requiredMyself ? data.requiredMyself : false],
        requiredMyselfCriteriaConditions: requiredMyselfCriteriaConditionsGroup,
        //Rellenar campo
        requiredFields: [data?.requiredFields ? true : false],
        requiredFieldsList: [
          data?.requiredFieldsList && this.fieldsList
            ? this.fieldsList
                .filter((field) => data.requiredFieldsList.find((f) => f.id === field.id))
                .map((field, index) => {
                  const dataField = data.requiredFieldsList.find((f) => f.id === field.id);
                  return {
                    ...field,
                    criteriaConditions: dataField?.criteriaConditions
                      ? this.fb.array(
                          dataField.criteriaConditions.map((cc, i) => {
                            this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i);
                          })
                        )
                      : this.fb.array([])
                  };
                })
            : []
        ],
        //Attachments required for events
        requiredAttachments: [data?.requiredAttachments ? true : false],
        workflowSubstateEventRequiredAttachments: [
          data?.workflowSubstateEventRequiredAttachments && this.attachmentList
            ? this.attachmentList
                .filter((attachment) => {
                  const attachments = Array.isArray(data.workflowSubstateEventRequiredAttachments)
                    ? data.workflowSubstateEventRequiredAttachments
                    : [data.workflowSubstateEventRequiredAttachments];
                  return attachments.find(
                    (f) => f.tab.id === attachment.id && f.templateAttachmentItem.id === attachment.templateAttachmentItemId
                  );
                })
                .map((attachment) => {
                  const attachments = Array.isArray(data.workflowSubstateEventRequiredAttachments)
                    ? data.workflowSubstateEventRequiredAttachments
                    : [data.workflowSubstateEventRequiredAttachments];

                  return {
                    ...attachment,
                    numberInput: attachments.find(
                      (f) => f.tab.id === attachment.id && f.templateAttachmentItem.id === attachment.templateAttachmentItemId
                    )?.numMinAttachRequired,
                    workflowEventConditionId: attachment?.workflowEventCondition?.id
                      ? attachment?.workflowEventCondition?.id
                      : null,
                    workflowMovementRequiredAttachmentId: attachment?.workflowEventCondition?.workflowMovementRequiredAttachmentId
                      ? attachment?.workflowEventCondition?.workflowMovementRequiredAttachmentId
                      : null,
                    workflowSubstateEventRequiredAttachmentId: attachment?.workflowEventCondition
                      ?.workflowSubstateEventRequiredAttachmentId
                      ? attachment?.workflowEventCondition?.workflowMovementRequiredAttachmentId
                      : null,
                    criteriaConditions: attachment?.workflowEventCondition?.workflowEventConditionItems?.length
                      ? this.fb.array(
                          attachment.workflowEventCondition.workflowEventConditionItems.map((cc, i) =>
                            this.wfEventsConditiosAuxService.getCriteriaFormGroup(cc, i)
                          )
                        )
                      : this.fb.array([])
                  };
                })
            : []
        ],
        //webservice
        webservice: [data?.webservice ? true : false],
        webserviceCriteriaConditions: requiredWebServicefCriteriaConditionsGroup,
        workflowEventWebserviceConfig: this.fb.group(
          {
            authAttributeToken: [
              data?.workflowEventWebserviceConfig?.authAttributeToken
                ? data.workflowEventWebserviceConfig.authAttributeToken
                : null
            ],
            authPass: [data?.workflowEventWebserviceConfig?.authPass ? data.workflowEventWebserviceConfig.authPass : null],
            authUrl: [data?.workflowEventWebserviceConfig?.authUrl ? data.workflowEventWebserviceConfig.authUrl : null],
            authUser: [data?.workflowEventWebserviceConfig?.authUser ? data.workflowEventWebserviceConfig.authUser : null],
            blocker: [data?.workflowEventWebserviceConfig?.blocker ? data.workflowEventWebserviceConfig.blocker : false],
            body: [data?.workflowEventWebserviceConfig?.body ? data.workflowEventWebserviceConfig.body : null],
            id: [data?.workflowEventWebserviceConfig?.id ? data.workflowEventWebserviceConfig.id : null],
            method: [
              data?.workflowEventWebserviceConfig?.method ? data.workflowEventWebserviceConfig.method : 'GET',
              [Validators.required]
            ],
            requireAuth: [
              data?.workflowEventWebserviceConfig?.requireAuth ? data.workflowEventWebserviceConfig.requireAuth : false
            ],
            variables: [data?.workflowEventWebserviceConfig?.variables ? data.workflowEventWebserviceConfig.variables : []],
            webserviceUrl: [
              data?.workflowEventWebserviceConfig?.webserviceUrl ? data.workflowEventWebserviceConfig.webserviceUrl : null
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
          ...validatorsExtra,
          WebserviceUrlValidator.validate
        ]
      }
    );
    this.formIntialized.emit(true);
  }
  onOptionSelectionChange(event: MatOptionSelectionChange, field: any): void {
    const requiredFieldsListControl = this.form.get('requiredFieldsList');
    const currentList = requiredFieldsListControl?.value || [];
    if (event.isUserInput && event.source.selected) {
      const existingField = currentList.find((item: any) => item.id === field.id && item.tabId === field.tabId);

      if (existingField) {
        if (!existingField.criteriaConditions) {
          existingField.criteriaConditions = [];
        }
      } else {
        const newField = {
          ...field,
          criteriaConditions: this.fb.array([])
        };
        const updatedList = [...currentList, newField];
        requiredFieldsListControl.setValue(updatedList);
      }
    } else if (event.isUserInput && !event.source.selected) {
      const updatedList = currentList.filter((item: any) => item.id !== field.id);
      requiredFieldsListControl.setValue(updatedList);
    }
  }

  public addWorkflowEventMails(): void {
    (this.form.get('workflowEventMails') as UntypedFormArray).push(
      this.fb.group({
        id: [null],
        sendMailAuto: [false],
        sendMailTemplate: [null],
        receiverTypes: [[]],
        receiverEmails: [[]],
        receiverRole: [null],
        workflowEventCondition: this.fb.group({
          id: [null],
          workflowEventType: ['EMAIL'],
          workflowEventConditionItems: this.fb.array([]),
          workflowMovementRequiredAttachmentId: [null]
        })
      })
    );
  }
  updateCriteriaConditions(event: MatOptionSelectionChange, attachment: any): void {
    const formControl = this.form.get('workflowSubstateEventRequiredAttachments');
    const currentList = formControl?.value || [];

    if (event.isUserInput && event.source.selected) {
      const existingAttachment = currentList.find(
        (item: any) => item.id === attachment.id && item.templateAttachmentItemId === attachment.templateAttachmentItemId
      );

      if (existingAttachment) {
        if (!existingAttachment.criteriaConditions || Array.isArray(existingAttachment.criteriaConditions)) {
          existingAttachment.criteriaConditions = this.fb.array([]);
        }
      } else {
        const newAttachment = {
          ...attachment,
          criteriaConditions: this.fb.array([])
        };
        const updatedList = [...currentList, newAttachment];
        formControl.setValue(updatedList);
      }
    } else if (event.isUserInput && !event.source.selected) {
      const updatedList = currentList.filter(
        (item: any) => item.id !== attachment.id || item.templateAttachmentItemId !== attachment.templateAttachmentItemId
      );
      formControl.setValue(updatedList);
    }
  }

  public deleteEmailEvent(position: number): void {
    if (this.form?.controls?.workflowEventMails) {
      this.confirmDialogService
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('common.deleteConfirmation'))
        })
        .pipe(take(1))
        .subscribe((ok) => {
          if (ok) {
            (this.form.controls.workflowEventMails as UntypedFormArray).removeAt(position);
          }
        });
    }
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

  public showTypeSelector(control: UntypedFormControl, type: 'ROLE' | 'OTHER'): boolean {
    return control.getRawValue().receiverTypes.indexOf(type) >= 0;
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

  public getWorkflowEventMail(mailEvent: any): WorkflowEventMailDTO {
    const workflowEventMailReceivers: WorkflowEventMailReceiverDTO[] = mailEvent.receiverTypes.map((type: string) => {
      switch (type) {
        case 'ROLE':
          if (mailEvent.receiverRole) {
            return {
              receiverType: 'ROLE',
              role: mailEvent.receiverRole
            };
          } else {
            return null;
          }
        case 'OTHER':
          if (mailEvent.receiverEmails?.length) {
            return {
              receiverType: 'OTHER',
              emails: mailEvent.receiverEmails.join(',')
            };
          } else {
            return null;
          }
        default:
          return {
            receiverType: type
          };
      }
    });
    const workflowEventMail = {
      id: mailEvent.id ? mailEvent.id : null,
      sendMailAuto: mailEvent.sendMailAuto,
      sendMailTemplate: mailEvent.sendMailTemplate,
      workflowEventMailReceivers: (workflowEventMailReceivers as WorkflowEventMailReceiverDTO[]).filter((d) => d),
      workflowEventCondition: mailEvent.workflowEventCondition?.workflowEventConditionItems?.length
        ? {
            ...mailEvent.workflowEventCondition,
            workflowEventConditionItems: mailEvent.workflowEventCondition.workflowEventConditionItems?.value
          }
        : null
    };
    return workflowEventMail;
  }

  public editWebService(): void {
    this.customDialogService
      .open({
        component: LinksCreationEditionDialogComponent,
        extendedComponentData: {
          form: this.form.get('workflowEventWebserviceConfig'),
          listVariables: this.listVariables,
          type: 'EVENT'
        },
        id: LinksCreationEditionDialogComponentModalEnum.ID,
        panelClass: LinksCreationEditionDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '750px'
      })
      .subscribe((result) => {
        // if (result?.tabItemConfigLink) {
        //   if (result.tabItemConfigLink.linkMethod === 'GET') {
        //     tab.get('tabItemConfigLink').get('body').setValue(null);
        //     if (result.tabItemConfigLink.redirect) {
        //       tab.get('tabItemConfigLink').get('requireAuth').setValue(false);
        //       result.tabItemConfigLink.requireAuth = false;
        //     }
        //   }
        //   if (result.tabItemConfigLink.linkMethod === 'POST') {
        //     tab.get('tabItemConfigLink').get('redirect').setValue(false);
        //   }
        //   if (!result.tabItemConfigLink.requireAuth) {
        //     tab.get('tabItemConfigLink').get('authPass').setValue(null);
        //     tab.get('tabItemConfigLink').get('authUrl').setValue(null);
        //     tab.get('tabItemConfigLink').get('authUser').setValue(null);
        //     tab.get('tabItemConfigLink').get('authAttributeToken').setValue(null);
        //   }
        // }
      });
  }

  public getFormValue(): any {
    const value = this.form.value;
    const formArray = this.form.value.workflowSubstateEventRequiredAttachments;
    if (formArray && this.attachmentList) {
      //@ts-ignore
      formArray.forEach((field, index) => {
        const matchingAttachment = this.attachmentList.find(
          (attachment) => attachment.id === field.id && attachment.templateAttachmentItemId === field.templateAttachmentItemId
        );
        if (matchingAttachment) {
          field.numberInput = matchingAttachment.numberInput;
        }
      });
    }

    // Construir los campos condicionales
    const workflowSubstateEventRequiredAttachmentsForm = this.form.value.workflowSubstateEventRequiredAttachments?.map(
      (field: any) => ({
        tab: { id: field.id },
        templateAttachmentItem: { id: field.templateAttachmentItemId },
        numMinAttachRequired: field.numberInput || 1,
        workflowEventCondition: field.criteriaConditions.length
          ? {
              id: field.workflowEventConditionId || null,
              workflowEventType: 'REQ_ATTACH',
              workflowEventConditionItems: field.criteriaConditions.controls.map((control: any) => control.value),
              workflowSubstateEventRequiredAttachmentId: field.workflowSubstateEventRequiredAttachmentId || null
            }
          : null
      })
    );

    const workflowMovementRequiredAttachmentsForm = this.form.value.workflowSubstateEventRequiredAttachments?.map(
      (field: any) => ({
        tab: { id: field.id },
        templateAttachmentItem: { id: field.templateAttachmentItemId },
        numMinAttachRequired: field.numberInput || 1,
        workflowEventCondition: field.criteriaConditions.length
          ? {
              id: field.workflowEventConditionId || null,
              workflowEventType: 'REQ_ATTACH',
              workflowEventConditionItems: field.criteriaConditions.controls.map((control: any) => control.value),
              workflowMovementRequiredAttachmentId: field.workflowMovementRequiredAttachmentId || null
            }
          : null
      })
    );

    // Crear formValue base
    const formValue = {
      ...value,
      requiredFieldsList: this.form.value.requiredFieldsList
        ? this.form.value.requiredFieldsList.map((field: any) => ({ id: field.id }))
        : [],
      roles: this.form.get('roles')?.value.filter((role: RoleDTO) => role.selected),
      workflowEventMails: value.sendMail
        ? value.workflowEventMails
            .map((data: any) => this.getWorkflowEventMail(data))
            .filter(
              (data: any) => data && data.sendMailTemplate && data.workflowEventMailReceivers?.filter((d: any) => d)?.length
            )
        : []
    };

    let formValueFinal: any;
    const sizeConditionGroup = this.form.get('requiredSizeCriteriaConditions') as FormGroup;
    const sizeConditionValue = sizeConditionGroup?.value;
    const conditionSizeItemsControl = sizeConditionGroup?.get('workflowEventConditionItems') as FormArray;
    const userConditionGroup = this.form.get('requiredUserCriteriaConditions') as FormGroup;
    const userConditionValue = userConditionGroup?.value;
    const conditionUserItemsControl = userConditionGroup?.get('workflowEventConditionItems') as FormArray;
    const myselfConditionGroup = this.form.get('requiredMyselfCriteriaConditions') as FormGroup;
    const myselfConditionValue = myselfConditionGroup?.value;
    const conditionMySelfItemsControl = myselfConditionGroup?.get('workflowEventConditionItems') as FormArray;
    const webServiceConditionGroup = this.form.get('webserviceCriteriaConditions') as FormGroup;
    const webserviceConditionValue = webServiceConditionGroup?.value;
    const conditionWebServiceItemsControl = myselfConditionGroup?.get('workflowEventConditionItems') as FormArray;
    const workflowEventConditionsFinal: any[] = [];
    if (this.eventType === 'MOV') {
      if (conditionSizeItemsControl?.value?.length) {
        workflowEventConditionsFinal.push({
          id: sizeConditionValue.id ?? null,
          workflowEventType: 'SIZE',
          workflowMovementId: sizeConditionValue.workflowMovementId ?? null,
          workflowEventConditionItems: sizeConditionValue.workflowEventConditionItems.controls.map(
            (control: any) => control.value
          )
        });
      }
      if (conditionUserItemsControl?.value?.length) {
        workflowEventConditionsFinal.push({
          id: userConditionValue.id ?? null,
          workflowEventType: 'USER',
          workflowMovementId: userConditionValue.workflowMovementId ?? null,
          workflowEventConditionItems: userConditionValue.workflowEventConditionItems.controls.map(
            (control: any) => control.value
          )
        });
      }
      if (conditionMySelfItemsControl?.value?.length) {
        workflowEventConditionsFinal.push({
          id: myselfConditionValue.id ?? null,
          workflowEventType: 'MYSELF',
          workflowMovementId: myselfConditionValue.workflowMovementId ?? null,
          workflowEventConditionItems: myselfConditionValue.workflowEventConditionItems.controls.map(
            (control: any) => control.value
          )
        });
      }
      if (conditionWebServiceItemsControl?.value?.length) {
        workflowEventConditionsFinal.push({
          id: webserviceConditionValue.id ?? null,
          workflowEventType: 'WEBSERVICE',
          workflowMovementId: webserviceConditionValue.workflowMovementId ?? null,
          workflowEventConditionItems: webserviceConditionValue.workflowEventConditionItems.controls.map(
            (control: any) => control.value
          )
        });
      }
    } else {
      if (conditionSizeItemsControl?.value?.length) {
        workflowEventConditionsFinal.push({
          id: sizeConditionValue.id ?? null,
          workflowEventType: 'SIZE',
          workflowSubstateId: sizeConditionValue.workflowSubstateId ?? null,
          workflowEventConditionItems: sizeConditionValue.workflowEventConditionItems.controls.map(
            (control: any) => control.value
          )
        });
      }
      if (conditionUserItemsControl?.value?.length) {
        workflowEventConditionsFinal.push({
          id: userConditionValue.id ?? null,
          workflowEventType: 'USER',
          workflowSubstateId: userConditionValue.workflowMovementId ?? null,
          workflowEventConditionItems: userConditionValue.workflowEventConditionItems.controls.map(
            (control: any) => control.value
          )
        });
      }
      if (conditionMySelfItemsControl?.value?.length) {
        workflowEventConditionsFinal.push({
          id: myselfConditionValue.id ?? null,
          workflowEventType: 'MYSELF',
          workflowSubstateId: myselfConditionValue.workflowMovementId ?? null,
          workflowEventConditionItems: myselfConditionValue.workflowEventConditionItems.controls.map(
            (control: any) => control.value
          )
        });
      }
      if (conditionWebServiceItemsControl?.value?.length) {
        workflowEventConditionsFinal.push({
          id: webserviceConditionValue.id ?? null,
          workflowEventType: 'WEBSERVICE',
          workflowSubstateId: webserviceConditionValue.workflowMovementId ?? null,
          workflowEventConditionItems: webserviceConditionValue.workflowEventConditionItems.controls.map(
            (control: any) => control.value
          )
        });
      }
    }
    if (this.eventType === 'MOV') {
      const { workflowSubstateEventRequiredAttachments, ...rest } = formValue;
      const {
        requiredSizeCriteriaConditions,
        requiredUserCriteriaConditions,
        requiredMyselfCriteriaConditions,
        webserviceCriteriaConditions,
        ...cleanRest
      } = rest;
      formValueFinal = {
        ...cleanRest,
        ...(value.requiredAttachments && {
          workflowMovementRequiredAttachments: workflowMovementRequiredAttachmentsForm
        }),
        workflowEventConditions: workflowEventConditionsFinal
      };
    } else {
      const { workflowMovementRequiredAttachments, ...rest } = formValue;
      const {
        requiredSizeCriteriaConditions,
        requiredUserCriteriaConditions,
        requiredMyselfCriteriaConditions,
        webserviceCriteriaConditions,
        ...cleanRest
      } = rest;
      formValueFinal = {
        ...cleanRest,
        ...(value.requiredAttachments && {
          workflowSubstateEventRequiredAttachments: workflowSubstateEventRequiredAttachmentsForm
        }),
        workflowEventConditions: workflowEventConditionsFinal
      };
    }

    return formValueFinal;
  }

  public onSubmitCustomDialog(): Observable<boolean> {
    console.log('entra');
    const formValue = this.getFormValue();
    console.log(formValue);
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

  public updateNumberInput(event: Event, field: any): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.valueAsNumber;
    field.numberInput = value;
  }

  public validateInput(event: any, field: any): void {
    const inputValue = event.target.value;
    if (inputValue < 0) {
      event.target.value = Math.abs(inputValue);
    }
    this.updateNumberInput(event, field);
  }

  public generateDisplayName(field: any): string {
    return `${field.templateName} - ${field.itemName} - ${field.numberInput}`;
  }

  public getMailEventTitle(mailEvent: UntypedFormControl): string {
    const value = mailEvent.getRawValue();
    let title = `${this.translateService.instant('userProfile.email')} ( `;
    if (value.sendMailAuto) {
      title += `${this.translateService.instant(marker('common.auto'))} # `;
    } else {
      title += `${this.translateService.instant(marker('common.manual'))} # `;
    }
    if (value.sendMailTemplate?.name) {
      title += `${value.sendMailTemplate?.name} # `;
    } else {
      title += '_____ # ';
    }
    if (value.receiverTypes?.length) {
      title += `${value.receiverTypes.map((type: string) => this.translateService.instant(this.labels[type])).join(', ')} )`;
    } else {
      title += '_____ )';
    }
    return title;
  }

  public getWfEventsMailsFormArray(): UntypedFormArray {
    if (this.form?.controls?.workflowEventMails) {
      return this.form.controls.workflowEventMails as UntypedFormArray;
    }
    return this.fb.array([]);
  }

  private async getCriteriaOptions(): Promise<void> {
    return new Promise((resolve, reject) => {
      const resquests = [
        this.advSearchService.getCriteria().pipe(take(1)),
        this.advSearchService.getAdvSearchOperators().pipe(take(1))
      ];
      forkJoin(resquests).subscribe({
        next: (responses: [AdvancedSearchOptionsDTO, AdvSearchOperatorDTO[]]) => {
          this.criteriaOptions = responses[0] ? responses[0] : { cards: {}, entities: {} };
          this.escapedValue = responses[0]?.escapedValue ? responses[0].escapedValue : '';
          this.operators = responses[1] ? responses[1] : [];
          resolve();
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          resolve();
        }
      });
    });
  }

  private async getTemplatesAndFields(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.workflowId) {
        resolve(false);
        return;
      }
      const requests = [
        this.workflowService.getWorkflowViewAttributes(this.workflowId).pipe(take(1)),
        this.administrationService.getTemplates(this.workflowId, 'COMUNICATION').pipe(take(1)),
        this.workflowService.getWorkflowTimelineAttachments(this.workflowId).pipe(take(1))
      ];
      forkJoin(requests).subscribe(
        (responses: [cards: CardColumnDTO[], templates: TemplatesCommonDTO[], attachments: WorkflowAttachmentTimelineDTO[]]) => {
          const fieldList: CardColumnTabItemDTO[] = [];
          //@ts-ignore
          const attachList = [];
          responses[0].forEach((cardCol: CardColumnDTO) => {
            cardCol.tabs.forEach((tab: CardColumnTabDTO) => {
              tab.tabItems.forEach((tabItem: CardColumnTabItemDTO) => {
                fieldList.push({ ...tabItem, name: `${cardCol.name} - ${tab.name} - ${tabItem.name}` });
              });
            });
          });
          responses[2]?.forEach((attachment) => {
            attachment.template.templateAttachmentItems.forEach((item) => {
              attachList.push({
                id: attachment.id,
                templateId: attachment.template.id,
                templateAttachmentItemId: item.id,
                templateName: attachment.name,
                itemName: item.name,
                numberInput: 1,
                criteriaConditions: []
              });
            });
          });
          //@ts-ignore
          this.fieldsList = fieldList;
          //@ts-ignore
          this.attachmentList = attachList;
          this.templatesList = responses[1];
          resolve(true);
        }
      );
    });
  }

  private getVariable(): void {
    const spinner = this.spinnerService.show();
    this.variablesService
      .searchVariables()
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe((res) => {
        this.listVariables = res;
      });
  }
}
