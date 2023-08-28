/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TemplateComunicationItemsDTO } from '@data/models/templates/templates-communication-dto';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowEventMailDTO from '@data/models/workflows/workflow-event-mail-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowSocketMoveDTO from '@data/models/workflows/workflow-socket-move-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
// eslint-disable-next-line max-len
import { WorkflowCardMovementPreparationComponent } from '../components/workflow-card-movement-preparation/workflow-card-movement-preparation.component';
import WorkflowCardsLimitDTO, {
  CardLimitSlotByDayDTO,
  CardLimitSlotDTO
} from '@data/models/workflow-admin/workflow-card-limit-dto';

@Injectable({
  providedIn: 'root'
})
export class WorkflowPrepareAndMoveService {
  public reloadData$: BehaviorSubject<'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS' | 'UPDATE_INFORMATION'> =
    new BehaviorSubject(null);
  //Used for WebSockets: card move in board, table and calendar view
  public moveCard$: BehaviorSubject<WorkflowSocketMoveDTO> = new BehaviorSubject(null);
  private readonly wSubstateKey = 'wSubstate-';
  private spinner: string;

  constructor(
    private workflowService: WorkflowsService,
    private dialog: MatDialog,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private spinnerService: ProgressSpinnerDialogService
  ) {}

  public prepareAndMove(
    item: WorkflowCardDTO,
    move: WorkflowMoveDTO,
    substateTarget: WorkflowSubstateDTO,
    user: WorkflowSubstateUserDTO,
    dropZoneId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemToReplace: any,
    view?: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS'
  ): void {
    this.spinner = this.spinnerService.show();
    view = view ? view : 'MOVES_IN_THIS_WORKFLOW';
    const workflowCardsLimit: WorkflowCardsLimitDTO = move?.workflowCardsLimit;
    if (workflowCardsLimit.workflowSubstate) {
      workflowCardsLimit.workflowSubstate.workflowSubstateEvents = workflowCardsLimit.workflowSubstate.workflowSubstateEvents
        ? workflowCardsLimit.workflowSubstate.workflowSubstateEvents
        : [];
    }
    const destinationName = this.getDestinationName(move ? move.workflowSubstateTarget : substateTarget);
    const targetId = move ? move.workflowSubstateTarget.id : substateTarget ? substateTarget.id : null;
    const cardIntanceId = item.cardInstanceWorkflows[0].id;
    const usersOut = move
      ? move.workflowSubstateSource.workflowSubstateUser
      : item?.workflowSubstate?.workflowSubstateUser
      ? item?.workflowSubstate?.workflowSubstateUser
      : [];
    const usersIn = move
      ? move.workflowSubstateTarget.workflowSubstateUser
      : substateTarget?.workflowSubstateUser
      ? substateTarget?.workflowSubstateUser
      : [];
    if (
      !user &&
      move &&
      move.workflowSubstateTarget.workflowState.front &&
      move.workflowSubstateTarget.workflowSubstateUser?.length === 1
    ) {
      user = move.workflowSubstateTarget.workflowSubstateUser[0];
    }
    const requests: Observable<WorkflowSubstateEventDTO[]>[] = [];
    requests.push(this.workflowService.prepareMovement(item, targetId).pipe(take(1)));
    // if (workflowCardsLimit.cardsLimit && workflowCardsLimit.allowOverLimit && workflowCardsLimit.workflowSubstate) {
    //   requests.push(this.workflowService.prepareMovement(item, workflowCardsLimit.workflowSubstate.id).pipe(take(1)));
    // }
    forkJoin(requests).subscribe(
      (responses: WorkflowSubstateEventDTO[][]) => {
        const data = responses[0];
        // const altData = responses?.length > 1 ? responses[1] : [];
        if (
          (data?.length &&
            // !data[0]?.requiredFields &&
            // !data[1]?.requiredFields &&
            // !data[2]?.requiredFields &&
            (data[0]?.requiredSize ||
              data[0]?.requiredUser ||
              data[0]?.requiredHistoryComment ||
              data[0]?.sendMail ||
              data[0]?.requiredMovementExtra ||
              data[1]?.requiredSize ||
              data[1]?.requiredUser ||
              data[1]?.requiredHistoryComment ||
              data[1]?.sendMail ||
              data[1]?.requiredMovementExtra ||
              data[2]?.requiredSize ||
              data[2]?.requiredUser ||
              data[2]?.requiredHistoryComment ||
              data[2]?.sendMail ||
              data[2]?.requiredMovementExtra)) ||
          this.showMainUserSelector(user, move) ||
          view === 'MOVES_IN_OTHER_WORKFLOWS'
        ) {
          this.dialog
            .open(WorkflowCardMovementPreparationComponent, {
              maxWidth: '655px',
              maxHeight: '95vh',
              data: {
                workflowId: targetId,
                cardInstanceId: item.cardInstanceWorkflows[0].cardInstanceId,
                destinationName,
                preparation: data,
                usersOut,
                usersIn,
                view,
                selectedUser: user,
                mainUserSelector: this.showMainUserSelector(user, move),
                workflowCardsLimit:
                  move.workflowSubstateSource.workflowState.workflow.id !==
                    move.workflowSubstateTarget.workflowState.workflow.id &&
                  move.workflowSubstateTarget.entryPoint &&
                  workflowCardsLimit
                    ? workflowCardsLimit
                    : null,
                altSubstateLimit:
                  move.workflowSubstateSource.workflowState.workflow.id !==
                    move.workflowSubstateTarget.workflowState.workflow.id &&
                  move.workflowSubstateTarget.entryPoint &&
                  workflowCardsLimit.cardsLimit
                    ? {
                        destinationName: this.getDestinationName(workflowCardsLimit.workflowSubstate),
                        // preparation: responses?.length > 1 && responses[1] ? responses[1] : [],
                        preparation: [
                          ...data.filter((d) => d.substateEventType === 'OUT'),
                          ...workflowCardsLimit.workflowSubstate.workflowSubstateEvents
                        ]
                          // .map((d: WorkflowSubstateEventDTO) => {
                          //   if (d.substateEventType === 'IN') {
                          //     return workflowCardsLimit.workflowSubstate.workflowSubstateEvents.find(
                          //       (e) => e.substateEventType === 'IN'
                          //     );
                          //   } else if (d.substateEventType === 'MOV') {
                          //     return workflowCardsLimit.workflowSubstate.workflowSubstateEvents.find(
                          //       (e) => e.substateEventType === 'MOV'
                          //     );
                          //   }
                          //   return d;
                          // })
                          .filter((d) => d),
                        usersIn: workflowCardsLimit.workflowSubstate.workflowSubstateUser
                      }
                    : null,
                cardIntanceId
              }
            })
            .afterClosed()
            .pipe(take(1))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .subscribe(
              (res: {
                task: { description: string };
                user: { user: WorkflowSubstateUserDTO };
                deadLine: { deadLineDate: Date; deadLineHour: CardLimitSlotDTO };
                targetId: number;
                cardsLimitsExceeded: boolean;
                in: {
                  size: 'S' | 'M' | 'L' | 'XL';
                  user: WorkflowSubstateUserDTO;
                  mailEvents: {
                    id: number;
                    items: {
                      id: number;
                      processedEmail: string[];
                      subject: string;
                      template: string;
                    }[];
                  }[];
                  historyComment: string;
                  movementExtraConfirm: boolean;
                };
                out: {
                  size: 'S' | 'M' | 'L' | 'XL';
                  user: WorkflowSubstateUserDTO;
                  mailEvents: {
                    id: number;
                    items: {
                      id: number;
                      processedEmail: string[];
                      subject: string;
                      template: string;
                    }[];
                  }[];
                  historyComment: string;
                  movementExtraConfirm: boolean;
                };
                mov: {
                  size: 'S' | 'M' | 'L' | 'XL';
                  user: WorkflowSubstateUserDTO;
                  mailEvents: {
                    id: number;
                    items: {
                      id: number;
                      processedEmail: string[];
                      subject: string;
                      template: string;
                    }[];
                  }[];
                  historyComment: string;
                  movementExtraConfirm: boolean;
                };
              }) => {
                if (!res) {
                  this.reloadData$.next('UPDATE_INFORMATION');
                  this.spinnerService.hide(this.spinner);
                  return;
                }
                const ungroupedEvents = res.cardsLimitsExceeded
                  ? [
                      ...data.filter((d) => d.substateEventType === 'OUT'),
                      ...workflowCardsLimit.workflowSubstate.workflowSubstateEvents
                    ].filter((d) => d)
                  : data;
                const events = {
                  in: ungroupedEvents.find((event: WorkflowSubstateEventDTO) => event.substateEventType === 'IN'),
                  out: ungroupedEvents.find((event: WorkflowSubstateEventDTO) => event.substateEventType === 'OUT'),
                  mov: ungroupedEvents.find((event: WorkflowSubstateEventDTO) => event.substateEventType === 'MOV')
                };
                const newData: WorkflowSubstateEventDTO[] = [];
                if (res.out && events.out) {
                  if (res.out.size) {
                    item.cardInstanceWorkflows[0].size = res.out.size;
                    events.out.size = res.out.size;
                  }
                  if (res.out.mailEvents?.length) {
                    events.out.workflowEventMails.map((e: WorkflowEventMailDTO) => {
                      const eventData = res.out.mailEvents.find((d) => d.id === e.id);
                      if (eventData) {
                        e.templateComunication.templateComunicationItems = e.templateComunication.templateComunicationItems.map(
                          (templateItem: TemplateComunicationItemsDTO) => {
                            const itemData = eventData.items.find((itemAux) => templateItem.id === itemAux.id);
                            e.processedEmail =
                              itemData.processedEmail && itemData.processedEmail.length
                                ? itemData.processedEmail.join(',')
                                : e.processedEmail;
                            templateItem.processedEmail = itemData.processedEmail.join(',');
                            //DGDC En algún momento puden que venga información también de sms y landing (habrá que verificar cuál es el canal)
                            templateItem.processedSubject = itemData.subject;
                            templateItem.processedText = itemData.template;
                            return templateItem;
                          }
                        );
                        return e;
                      } else {
                        return e;
                      }
                    });
                  }
                  if (res.out.historyComment) {
                    events.out.historyComment = res.out.historyComment;
                  }
                  events.out.movementExtraConfirm = false;
                  if (res.out.movementExtraConfirm) {
                    events.out.movementExtraConfirm = res.out.movementExtraConfirm;
                  }
                  if (res.out.user?.user?.id) {
                    events.out.requiredUserId = res.out.user.user.id;
                  }
                  newData.push(events.out);
                }
                if (res.in && events.in) {
                  if (res.in.size) {
                    item.cardInstanceWorkflows[0].size = res.in.size;
                    events.in.size = res.in.size;
                  }
                  if (res.in.mailEvents?.length) {
                    events.in.workflowEventMails.map((e: WorkflowEventMailDTO) => {
                      const eventData = res.in.mailEvents.find((d) => d.id === e.id);
                      if (eventData) {
                        e.templateComunication.templateComunicationItems = e.templateComunication.templateComunicationItems.map(
                          (templateItem: TemplateComunicationItemsDTO) => {
                            const itemData = eventData.items.find((itemAux) => templateItem.id === itemAux.id);
                            e.processedEmail =
                              itemData.processedEmail && itemData.processedEmail.length
                                ? itemData.processedEmail.join(',')
                                : e.processedEmail;
                            templateItem.processedEmail = itemData.processedEmail.join(',');
                            //DGDC En algún momento puden que venga información también de sms y landing (habrá que verificar cuál es el canal)
                            templateItem.processedSubject = itemData.subject;
                            templateItem.processedText = itemData.template;
                            return templateItem;
                          }
                        );
                        return e;
                      } else {
                        return e;
                      }
                    });
                  }
                  if (res.in.historyComment) {
                    events.in.historyComment = res.in.historyComment;
                  }
                  events.in.movementExtraConfirm = false;
                  if (res.in.movementExtraConfirm) {
                    events.in.movementExtraConfirm = res.in.movementExtraConfirm;
                  }
                  if (res.in.user?.user?.id) {
                    events.in.requiredUserId = res.in.user.user.id;
                  }
                  newData.push(events.in);
                }
                if (res.mov && events.mov) {
                  if (res.mov.size) {
                    item.cardInstanceWorkflows[0].size = res.mov.size;
                    events.mov.size = res.mov.size;
                  }
                  if (res.mov.mailEvents?.length) {
                    events.mov.workflowEventMails.map((e: WorkflowEventMailDTO) => {
                      const eventData = res.mov.mailEvents.find((d) => d.id === e.id);
                      if (eventData) {
                        e.templateComunication.templateComunicationItems = e.templateComunication.templateComunicationItems.map(
                          (templateItem: TemplateComunicationItemsDTO) => {
                            const itemData = eventData.items.find((itemAux) => templateItem.id === itemAux.id);
                            e.processedEmail =
                              itemData.processedEmail && itemData.processedEmail.length
                                ? itemData.processedEmail.join(',')
                                : e.processedEmail;
                            templateItem.processedEmail = itemData.processedEmail.join(',');
                            //DGDC En algún momento puden que venga información también de sms y landing (habrá que verificar cuál es el canal)
                            templateItem.processedSubject = itemData.subject;
                            templateItem.processedText = itemData.template;
                            return templateItem;
                          }
                        );
                        return e;
                      } else {
                        return e;
                      }
                    });
                  }
                  if (res.mov.historyComment) {
                    events.mov.historyComment = res.mov.historyComment;
                  }
                  events.mov.movementExtraConfirm = false;
                  if (res.mov.movementExtraConfirm) {
                    events.mov.movementExtraConfirm = res.mov.movementExtraConfirm;
                  }
                  if (res.mov.user?.user?.id) {
                    events.mov.requiredUserId = res.mov.user.user.id;
                  }
                  newData.push(events.mov);
                }
                if (res.task?.description) {
                  item.cardInstanceWorkflows[0].information = res.task.description;
                }
                if (res.user?.user) {
                  user = res.user.user;
                }
                item.cardInstanceWorkflows[0].workflowSubstateEvents = newData;
                const tId = res.targetId ? res.targetId : targetId;
                let deadLineDate: number = null;
                if (res.deadLine?.deadLineDate && res.deadLine?.deadLineHour) {
                  const date = res.deadLine.deadLineDate as Date;
                  const hour = res.deadLine.deadLineHour;
                  date.setHours(hour.hourFrom);
                  deadLineDate = +date;
                }
                this.moveCard(item, tId, user, dropZoneId, itemToReplace, view, deadLineDate);
              },
              (error) => {
                this.spinnerService.hide(this.spinner);
                this.globalMessageService.showError({
                  message: error?.message ? error.message : this.translateService.instant(marker('errors.unknown')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            );
        } else if (data?.length) {
          item.cardInstanceWorkflows[0].workflowSubstateEvents = data;
          this.moveCard(item, targetId, user, dropZoneId, itemToReplace, view);
        } else {
          this.moveCard(item, targetId, user, dropZoneId, itemToReplace, view);
        }
        // item: WorkflowCardDTO,
        // move: WorkflowMoveDTO,
        // substateTarget: WorkflowSubstateDTO,
        // user: WorkflowSubstateUserDTO,
        // dropZoneId: string,
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // itemToReplace: any,
        // view?: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS'
      },
      (error) => {
        this.reloadData$.next('UPDATE_INFORMATION');
        this.spinnerService.hide(this.spinner);
        this.globalMessageService.showError({
          message: error?.message ? error.message : this.translateService.instant(marker('errors.unknown')),
          actionText: this.translateService.instant(marker('common.close'))
        });
      }
    );
  }

  private showMainUserSelector(user: WorkflowSubstateUserDTO, move: WorkflowMoveDTO): boolean {
    if (
      // !user &&
      move &&
      move.workflowSubstateTarget.workflowState.front &&
      move.workflowSubstateTarget.workflowSubstateUser?.length
    ) {
      return true;
    }
    return false;
  }

  private moveCard(
    item: WorkflowCardDTO,
    targetId: number,
    user: WorkflowSubstateUserDTO,
    dropZoneId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemToReplace: any,
    view: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS',
    deaLineDate: number = null
  ): void {
    this.workflowService
      .moveWorkflowCardToSubstate(
        item,
        targetId,
        user,
        dropZoneId.indexOf(`${this.wSubstateKey}${item.cardInstanceWorkflows[0].workflowSubstateId}`) >= 0
          ? itemToReplace.orderNumber
          : null,
        deaLineDate
      )
      .pipe(take(1))
      .subscribe(
        (resp: WorkflowMoveDTO[]) => {
          if (this.spinner) {
            this.spinnerService.hide(this.spinner);
          }
          if (resp && resp.length > 0 && resp[0].workflowSubstateTarget.id !== targetId) {
            if (item?.cardInstanceWorkflows?.length && item.cardInstanceWorkflows[0].cardInstanceWorkflowUsers?.length) {
              user = item.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0];
            }
            if (item?.cardInstanceWorkflows?.length && item.cardInstanceWorkflows[0].workflowSubstateEvents) {
              item.cardInstanceWorkflows[0].workflowSubstateEvents = [];
            }
            this.spinner = null;
            this.prepareAndMove(item, resp[0], null, user, dropZoneId, itemToReplace, 'MOVES_IN_THIS_WORKFLOW');
          } else {
            this.spinner = null;
          }
          this.reloadData$.next('UPDATE_INFORMATION');
        },
        (error: ConcenetError) => {
          this.spinnerService.hide(this.spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error?.message ? error.message : this.translateService.instant(marker('errors.unknown')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.spinner = null;
          this.reloadData$.next('UPDATE_INFORMATION');
        }
      );
  }

  private getDestinationName(target: WorkflowSubstateDTO): string {
    let name = '';
    if (target.workflowState?.workflow?.name) {
      name += `${target.workflowState.workflow.name} - `;
    }
    if (target.workflowState?.name) {
      name += `${target.workflowState.name} - `;
    }
    name += target.name;
    return name;
  }
}
