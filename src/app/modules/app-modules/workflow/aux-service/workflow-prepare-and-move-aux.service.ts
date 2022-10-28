import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowCardInstanceDTO from '@data/models/workflows/workflow-card-instance-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
// eslint-disable-next-line max-len
import { WorkflowCardMovementPreparationComponent } from '../components/workflow-card-movement-preparation/workflow-card-movement-preparation.component';

@Injectable({
  providedIn: 'root'
})
export class WorkflowPrepareAndMoveService {
  public reloadData$: BehaviorSubject<'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS'> = new BehaviorSubject(null);
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
    const targetId = move ? move.workflowSubstateTarget.id : substateTarget ? substateTarget.id : null;
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
    this.workflowService
      .prepareMovement(item, targetId)
      .pipe(take(1))
      .subscribe(
        (data: WorkflowSubstateEventDTO[]) => {
          if (
            (data?.length &&
              // !data[0]?.requiredFields &&
              // !data[1]?.requiredFields &&
              // !data[2]?.requiredFields &&
              (data[0]?.requiredSize ||
                data[0]?.requiredUser ||
                data[0]?.sendMail ||
                data[1]?.requiredSize ||
                data[1]?.requiredUser ||
                data[1]?.sendMail ||
                data[2]?.requiredSize ||
                data[2]?.requiredUser ||
                data[2]?.sendMail)) ||
            this.showMainUserSelector(user, move) ||
            view === 'MOVES_IN_OTHER_WORKFLOWS'
          ) {
            this.dialog
              .open(WorkflowCardMovementPreparationComponent, {
                maxWidth: '650px',
                data: {
                  preparation: data,
                  usersOut,
                  usersIn,
                  view,
                  selectedUser: user,
                  mainUserSelector: this.showMainUserSelector(user, move)
                }
              })
              .afterClosed()
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .subscribe(
                (res: {
                  task: { description: string };
                  user: { user: WorkflowSubstateUserDTO };
                  in: { size: 'S' | 'M' | 'L' | 'XL'; user: WorkflowSubstateUserDTO; template: string };
                  out: { size: 'S' | 'M' | 'L' | 'XL'; user: WorkflowSubstateUserDTO; template: string };
                  mov: { size: 'S' | 'M' | 'L' | 'XL'; user: WorkflowSubstateUserDTO; template: string };
                }) => {
                  if (!res) {
                    //Recargamos para que al mover tarjeta en vista board no se quede pillado el hover de cdk drag and drop
                    this.reloadData$.next(view);
                    this.spinnerService.hide(this.spinner);
                    return;
                  }
                  const events = {
                    in: data.find((event: WorkflowSubstateEventDTO) => event.substateEventType === 'IN'),
                    out: data.find((event: WorkflowSubstateEventDTO) => event.substateEventType === 'OUT'),
                    mov: data.find((event: WorkflowSubstateEventDTO) => event.substateEventType === 'MOV')
                  };
                  const newData: WorkflowSubstateEventDTO[] = [];
                  if (res.out && events.out) {
                    if (res.out.size) {
                      item.cardInstanceWorkflows[0].size = res.out.size;
                    }
                    if (res.out.template) {
                      events.out.templateComunication.processedTemplate = res.out.template;
                    }
                    if (res.out.user?.user?.id) {
                      events.out.requiredUserId = res.out.user.user.id;
                    }
                    newData.push(events.out);
                  }
                  if (res.in && events.in) {
                    if (res.in.size) {
                      item.cardInstanceWorkflows[0].size = res.in.size;
                    }
                    if (res.in.template) {
                      events.in.templateComunication.processedTemplate = res.in.template;
                    }
                    if (res.in.user?.user?.id) {
                      events.in.requiredUserId = res.in.user.user.id;
                    }
                    newData.push(events.in);
                  }
                  if (res.mov && events.mov) {
                    if (res.mov.size) {
                      item.cardInstanceWorkflows[0].size = res.mov.size;
                    }
                    if (res.mov.template) {
                      events.mov.templateComunication.processedTemplate = res.mov.template;
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
                  this.moveCard(item, targetId, user, dropZoneId, itemToReplace, view);
                },
                (error) => {
                  this.reloadData$.next(null);
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
        },
        (error) => {
          this.reloadData$.next(null);
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
      !user &&
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
    view: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS'
  ): void {
    this.workflowService
      .moveWorkflowCardToSubstate(
        item,
        targetId,
        user,
        dropZoneId.indexOf(`${this.wSubstateKey}${item.cardInstanceWorkflows[0].workflowSubstateId}`) >= 0
          ? itemToReplace.orderNumber
          : null
      )
      .pipe(take(1))
      .subscribe(
        (resp: WorkflowCardInstanceDTO) => {
          if (this.spinner) {
            this.spinnerService.hide(this.spinner);
          }
          if (resp) {
            this.reloadData$.next(view);
          } else {
            this.reloadData$.next(null);
          }
          this.spinner = null;
        },
        (error: ConcenetError) => {
          this.spinnerService.hide(this.spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error?.message ? error.message : this.translateService.instant(marker('errors.unknown')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.spinner = null;
        }
      );
  }
}
