import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowCardInstanceDTO from '@data/models/workflows/workflow-card-instance-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
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
  public reloadData$: BehaviorSubject<number> = new BehaviorSubject(null);
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
    user: WorkflowSubstateUserDTO,
    dropZoneId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemToReplace: any,
    view?: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS'
  ): void {
    this.spinner = this.spinnerService.show();
    view = view ? view : 'MOVES_IN_THIS_WORKFLOW';
    this.workflowService
      .prepareMovement(item, move)
      .pipe(take(1))
      .subscribe((data: WorkflowSubstateEventDTO[]) => {
        if (
          (data?.length &&
            !data[0]?.requiredFields &&
            !data[1]?.requiredFields &&
            (data[0]?.requiredSize ||
              data[0]?.requiredUser ||
              data[0]?.sendMail ||
              data[1]?.requiredSize ||
              data[1]?.requiredUser ||
              data[1]?.sendMail)) ||
          view === 'MOVES_IN_OTHER_WORKFLOWS'
        ) {
          this.dialog
            .open(WorkflowCardMovementPreparationComponent, {
              maxWidth: '650px',
              data: {
                preparation: data,
                usersOut: move.workflowSubstateTarget.workflowSubstateUser,
                usersIn: move.workflowSubstateSource.workflowSubstateUser,
                view,
                selectedUser: user
              }
            })
            .afterClosed()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .subscribe(
              (res: {
                task: { description: string };
                in: { size: 'S' | 'M' | 'L' | 'XL'; user: WorkflowSubstateUserDTO; template: string };
                out: { size: 'S' | 'M' | 'L' | 'XL'; user: WorkflowSubstateUserDTO; template: string };
              }) => {
                if (!res) {
                  //Recargamos para que al mover tarjeta en vista board no se quede pillado el hover de cdk drag and drop
                  this.reloadData$.next(+new Date());
                  this.spinnerService.hide(this.spinner);
                  return;
                }
                const events = {
                  in: data.find((event: WorkflowSubstateEventDTO) => event.substateEventType === 'IN'),
                  out: data.find((event: WorkflowSubstateEventDTO) => event.substateEventType === 'OUT')
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
                if (res.task?.description) {
                  item.cardInstanceWorkflows[0].information = res.task.description;
                }
                item.cardInstanceWorkflows[0].workflowSubstateEvents = newData;
                this.moveCard(item, move, user, dropZoneId, itemToReplace);
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
        } else if (data?.length && (data[0]?.requiredFields || data[1].requiredFields)) {
          item.cardInstanceWorkflows[0].workflowSubstateEvents = data;
          this.moveCard(item, move, user, dropZoneId, itemToReplace);
        } else {
          this.moveCard(item, move, user, dropZoneId, itemToReplace);
        }
      });
  }

  private moveCard(
    item: WorkflowCardDTO,
    move: WorkflowMoveDTO,
    user: WorkflowSubstateUserDTO,
    dropZoneId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemToReplace: any
  ): void {
    this.workflowService
      .moveWorkflowCardToSubstate(
        item,
        move,
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
            this.reloadData$.next(+new Date());
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
