import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { take } from 'rxjs/operators';

export type MoveCardDialogConfig = {
  cardInstance: CardInstanceDTO;
  idCard: number;
};

export type MovesByState = {
  anchor: boolean;
  color: string;
  front: boolean;
  hideBoard: boolean;
  id: number;
  locked: boolean;
  name: string;
  orderNumber: number;
  workflow: WorkflowDTO;
  workflowSubstates: WorkflowSubstateDTO[];
  workflowSubstateTargets: WorkflowSubstateDTO[];
};

export type MovesByWorkflow = {
  id: number;
  name: string;
  status: string;
  movesByState: MovesByState[];
  facilities?: FacilityDTO[];
  manualCreateCard?: boolean;
};

@Component({
  selector: 'app-move-card-dialog',
  templateUrl: './move-card-dialog.component.html',
  styleUrls: ['./move-card-dialog.component.scss']
})
export class MoveCardDialogComponent implements OnInit {
  public labels = {
    moveCard: marker('cards.moveCard'),
    moveWhere: marker('cards.moveWhere'),
    statesInThisWorkflow: marker('cards.statesInThisWorkflow'),
    otherWorkflows: marker('cards.otherWorkflows'),
    noMovesAvailable: marker('cards.noMovesAvailable')
  };
  public view: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS' = 'MOVES_IN_THIS_WORKFLOW';
  public cardInstance: CardInstanceDTO = null;
  public idCard: number = null;
  public allMovements: WorkflowMoveDTO[] = [];
  public sameWorkflowMovements: MovesByWorkflow = null;
  public otherWorkflowMovements: MovesByWorkflow[] = [];

  constructor(
    public dialogRef: MatDialogRef<MoveCardDialogComponent>,
    private cardService: CardService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public config: MoveCardDialogConfig
  ) {}

  ngOnInit(): void {
    this.cardInstance = this.config.cardInstance;
    this.idCard = this.config.idCard;
    this.getMovements();
  }

  public close(): void {
    this.dialogRef.close();
  }

  public changeView(): void {
    if (this.view === 'MOVES_IN_OTHER_WORKFLOWS') {
      this.view = 'MOVES_IN_THIS_WORKFLOW';
    } else {
      this.view = 'MOVES_IN_OTHER_WORKFLOWS';
    }
  }

  private getMovements(): void {
    const spinner = this.spinnerService.show();
    this.cardService
      .getCardInstanceMovements(this.idCard)
      .pipe(take(1))
      .subscribe(
        (movements: WorkflowMoveDTO[]) => {
          this.allMovements = movements;
          this.setTypeOfMovements();
          this.spinnerService.hide(spinner);
        },
        (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.spinnerService.hide(spinner);
        }
      );
  }

  private setTypeOfMovements(): void {
    this.sameWorkflowMovements = null;
    this.otherWorkflowMovements = [];
    if (this.allMovements?.length) {
      this.sameWorkflowMovements = this.createMovesTree([
        ...this.allMovements.filter(
          (move: WorkflowMoveDTO) =>
            move.workflowSubstateTarget.workflowState.workflow.id === move.workflowSubstateSource.workflowState.workflow.id
        )
      ])[0];
      this.otherWorkflowMovements = this.createMovesTree([
        ...this.allMovements.filter(
          (move: WorkflowMoveDTO) =>
            move.workflowSubstateTarget.workflowState.workflow.id !== move.workflowSubstateSource.workflowState.workflow.id
        )
      ]);
    }
    console.log(this.sameWorkflowMovements, this.otherWorkflowMovements);
  }

  private createMovesTree(moves: WorkflowMoveDTO[]): MovesByWorkflow[] {
    const tree: MovesByWorkflow[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auxTreeObjByWorkflowId: any = {};
    if (moves?.length) {
      moves.forEach((move: WorkflowMoveDTO) => {
        if (!auxTreeObjByWorkflowId[move.workflowSubstateTarget.workflowState.workflow.id]) {
          const movesByWorkflow: MovesByWorkflow = { ...move.workflowSubstateTarget.workflowState.workflow, movesByState: [] };
          movesByWorkflow.movesByState = [{ ...move.workflowSubstateTarget.workflowState, workflowSubstateTargets: [] }];
          movesByWorkflow.movesByState[0].workflowSubstateTargets = [move.workflowSubstateTarget];
          auxTreeObjByWorkflowId[move.workflowSubstateTarget.workflowState.workflow.id] = movesByWorkflow;
        } else {
          const movesByWorkflow: MovesByWorkflow = auxTreeObjByWorkflowId[move.workflowSubstateTarget.workflowState.workflow.id];
          console.log(movesByWorkflow);
          const movesByState: MovesByState = movesByWorkflow.movesByState.filter(
            (m: MovesByState) => m.id === move.workflowSubstateTarget.workflowState.id
          )[0];
          if (movesByState) {
            movesByState.workflowSubstateTargets.push(move.workflowSubstateTarget);
          } else {
            //Otro estado diferente al que ya hemos registrado
            const newMoveByState: MovesByState = {
              ...move.workflowSubstateTarget.workflowState,
              workflowSubstateTargets: [move.workflowSubstateTarget]
            };
            movesByWorkflow.movesByState.push(newMoveByState);
          }
        }
      });
    }
    Object.keys(auxTreeObjByWorkflowId).forEach((k) => {
      tree.push(auxTreeObjByWorkflowId[k]);
    });
    console.log(tree);
    return tree;
  }
}
