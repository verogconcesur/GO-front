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
    itemToReplace: any
  ): void {
    this.spinner = this.spinnerService.show();
    this.workflowService
      .prepareMovement(item, move)
      .pipe(take(1))
      .subscribe((data: WorkflowSubstateEventDTO[]) => {
        if (
          data?.length &&
          (data[0]?.requiredSize ||
            data[0]?.requiredUser ||
            data[0]?.sendMail ||
            data[1]?.requiredSize ||
            data[1]?.requiredUser ||
            data[1]?.sendMail)
        ) {
          this.dialog
            .open(WorkflowCardMovementPreparationComponent, {
              maxWidth: '650px',
              data: { preparation: data, users: move.workflowSubstateTarget.workflowSubstateUser }
            })
            .afterClosed()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .subscribe(
              (res: {
                in: { size: 'S' | 'M' | 'L' | 'XL'; user: WorkflowSubstateUserDTO; template: string };
                out: { size: 'S' | 'M' | 'L' | 'XL'; user: WorkflowSubstateUserDTO; template: string };
              }) => {
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
                item.cardInstanceWorkflows[0].workflowSubstateEvents = newData;

                this.moveCard(item, move, user, dropZoneId, itemToReplace);
              },
              (error) => {
                console.log(error);
                this.spinnerService.hide(this.spinner);
              }
            );
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
          this.spinnerService.hide(this.spinner);
          if (resp) {
            this.reloadData$.next(+new Date());
          }
        },
        (error: ConcenetError) => {
          this.spinnerService.hide(this.spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
}
