import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { take } from 'rxjs/operators';
// eslint-disable-next-line max-len
import { WorkflowCardMovementPreparationComponent } from '../components/workflow-card-movement-preparation/workflow-card-movement-preparation.component';

@Injectable({
  providedIn: 'root'
})
export class WorkflowPrepareAndMoveService {
  constructor(private workflowService: WorkflowsService, private dialog: MatDialog) {}

  public prepareAndMove(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: WorkflowCardDTO,
    move: WorkflowMoveDTO,
    user: WorkflowSubstateUserDTO,
    dropZoneId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemToReplace: any
  ): void {
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
          console.log(move);
          this.dialog
            .open(WorkflowCardMovementPreparationComponent, {
              maxWidth: '650px',
              data: { preparation: data, users: move.workflowSubstateTarget.workflowSubstateUser }
            })
            .afterClosed()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .subscribe((res: any) => {
              console.log(res);
            });
        }
      });
    // this.workflowService.moveWorkflowCardToSubstate(
    //   item.cardInstanceWorkflows[0].facilityId,
    //   item,
    //   move,
    //   user,
    //   dropZoneId.indexOf(`${this.wSubstateKey}${item.cardInstanceWorkflows[0].workflowSubstateId}`) >= 0
    //     ? itemToReplace.orderNumber
    //     : null
    //   // itemToReplace.orderNumber
    // );
  }
}
