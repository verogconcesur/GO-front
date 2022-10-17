import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import UserDTO from '@data/models/user-permissions/user-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { CardService } from '@data/services/cards.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { map, take } from 'rxjs/operators';
import * as lodash from 'lodash';
import { normalizaStringToLowerCase } from '@shared/utils/string-normalization-lower-case';
import { Observable, of } from 'rxjs';
import { WorkflowPrepareAndMoveService } from '@modules/app-modules/workflow/aux-service/workflow-prepare-and-move-aux.service';
import CardDTO from '@data/models/cards/card-dto';

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export type MoveCardDialogConfig = {
  cardInstance: CardInstanceDTO;
  card: CardDTO;
  idCard: number;
};

export interface MovesByState extends TreeNode {
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
  children: WorkflowSubstateDTO[];
}

export interface MovesByWorkflow extends TreeNode {
  id: number;
  name: string;
  status: string;
  children: MovesByState[];
  facilities?: FacilityDTO[];
  manualCreateCard?: boolean;
}

@UntilDestroy()
@Component({
  selector: 'app-move-card-dialog',
  templateUrl: './move-card-dialog.component.html',
  styleUrls: ['./move-card-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MoveCardDialogComponent implements OnInit {
  public labels = {
    moveCard: marker('cards.moveCard'),
    moveWhere: marker('cards.moveWhere'),
    statesInThisWorkflow: marker('cards.statesInThisWorkflow'),
    otherWorkflows: marker('cards.otherWorkflows'),
    noMovesAvailable: marker('cards.noMovesAvailable'),
    filter: marker('common.filterAction'),
    noData: marker('errors.noDataToShow')
  };
  public view: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS' = 'MOVES_IN_THIS_WORKFLOW';
  public cardInstance: CardInstanceDTO = null;
  public idCard: number = null;
  public allMovements: WorkflowMoveDTO[] = [];
  public sameWorkflowMovements: MovesByWorkflow = null;
  public otherWorkflowMovements: MovesByWorkflow[] = [];
  public filterTextSearchControl = new UntypedFormControl();
  public nodesIndexAndNamesSameWorkflow: { nodes: number[]; name: string }[] = [];
  public nodesIndexAndNamesOtherWorkflow: { nodes: number[]; name: string }[] = [];

  public treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  public dataSource = new MatTreeNestedDataSource<TreeNode>();

  //Used to highlight the results
  public searchedWords$: Observable<string[]> = of([]);

  constructor(
    public dialogRef: MatDialogRef<MoveCardDialogComponent>,
    private cardService: CardService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,
    @Inject(MAT_DIALOG_DATA) public config: MoveCardDialogConfig
  ) {}

  ngOnInit(): void {
    this.cardInstance = this.config.cardInstance;
    this.idCard = this.config.idCard;
    this.getMovements();
    this.filterTextSearchControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (value) {
        this.searchedWords$ = of([value]);
      } else {
        this.searchedWords$ = of([]);
      }
      this.filter();
    });
    this.initListeners();
  }

  public hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

  public initListeners(): void {
    this.prepareAndMoveService.reloadData$.pipe(untilDestroyed(this)).subscribe((data: number) => {
      if (data) {
        this.dialogRef.close(true);
        //DGDC TODO: mirar por qué no se puede abrir de nuevo la modal
        window.location.reload();
      }
    });
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
    this.setViewData();
  }

  public setViewData(): void {
    this.resetFilter();
    if (this.view === 'MOVES_IN_THIS_WORKFLOW') {
      this.setNodesToShow(this.sameWorkflowMovements.children);
    } else {
      this.setNodesToShow(this.otherWorkflowMovements);
    }
  }

  public resetFilter(): void {
    this.filterTextSearchControl.setValue(null);
  }

  public filter(): void {
    let originalData: TreeNode[] = lodash.cloneDeep(this.otherWorkflowMovements);
    if (this.view === 'MOVES_IN_THIS_WORKFLOW') {
      originalData = lodash.cloneDeep(this.sameWorkflowMovements.children);
    }
    const filterValue = this.filterTextSearchControl.value ? normalizaStringToLowerCase(this.filterTextSearchControl.value) : '';
    if (filterValue) {
      this.setNodesToShow(this.filterNodes(filterValue, originalData));
      this.treeControl.expandAll();
    } else {
      this.setNodesToShow(originalData);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public moveCardTo(node: any): void {
    this.prepareAndMoveService.prepareAndMove(
      {
        cardId: null,
        customerId: null,
        id: null,
        repairOrderId: null,
        tabItems: [],
        vehicleId: null,
        colors: [],
        movements: [],
        cardInstanceWorkflows: [this.cardInstance.cardInstanceWorkflow]
      },
      node.move,
      node.user ? { id: null, name: '', user: node.user, permissionType: '', workflowSubstateId: null } : null,
      '',
      null,
      this.view
    );
  }

  private setNodesToShow(data: TreeNode[]): void {
    this.dataSource.data = null;
    this.treeControl.dataNodes = null;
    this.dataSource.data = data;
    this.treeControl.dataNodes = data;
  }

  private filterNodes(filterValue: string, data: TreeNode[]): TreeNode[] {
    return data.filter((item: TreeNode) => {
      if (normalizaStringToLowerCase(item.name ? item.name : '').indexOf(filterValue) >= 0) {
        return item;
      } else if (item.children?.length) {
        item.children = this.filterNodes(filterValue, item.children);
        if (item.children.length) {
          return item;
        }
      }
      return null;
    });
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
      this.sameWorkflowMovements = this.createMovesTree(
        [
          ...this.allMovements.filter(
            (move: WorkflowMoveDTO) =>
              move.workflowSubstateTarget.workflowState.workflow.id === move.workflowSubstateSource.workflowState.workflow.id
          )
        ],
        'MOVES_IN_THIS_WORKFLOW'
      )[0];
      this.otherWorkflowMovements = this.createMovesTree(
        [
          ...this.allMovements.filter(
            (move: WorkflowMoveDTO) =>
              move.workflowSubstateTarget.workflowState.workflow.id !== move.workflowSubstateSource.workflowState.workflow.id
          )
        ],
        'MOVES_IN_OTHER_WORKFLOWS'
      );
    }
    this.setViewData();
  }

  private createMovesTree(
    moves: WorkflowMoveDTO[],
    type: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS'
  ): MovesByWorkflow[] {
    const tree: MovesByWorkflow[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auxTreeObjByWorkflowId: any = {};
    if (moves?.length) {
      moves.forEach((move: WorkflowMoveDTO) => {
        move.workflowSubstateTarget.workflowState.workflow.name =
          'Workflow "' + move.workflowSubstateTarget.workflowState.workflow.name + '"';
        if (!auxTreeObjByWorkflowId[move.workflowSubstateTarget.workflowState.workflow.id]) {
          const movesByWorkflow: MovesByWorkflow = { ...move.workflowSubstateTarget.workflowState.workflow, children: [] };
          movesByWorkflow.children = [
            { ...move.workflowSubstateTarget.workflowState, workflowSubstateTargets: [], children: [] }
          ];
          movesByWorkflow.children[0].workflowSubstateTargets = [move.workflowSubstateTarget];
          if (move.workflowSubstateTarget.workflowState.front) {
            movesByWorkflow.children[0].workflowSubstateTargets[0].children = [
              ...movesByWorkflow.children[0].workflowSubstateTargets[0].workflowSubstateUser
            ].map((user: WorkflowSubstateUserDTO) => {
              user.name = user.user.fullName;
              user.move = move;
              return user;
            });
          } else {
            movesByWorkflow.children[0].workflowSubstateTargets[0].move = move;
          }
          movesByWorkflow.children[0].children = movesByWorkflow.children[0].workflowSubstateTargets;
          auxTreeObjByWorkflowId[move.workflowSubstateTarget.workflowState.workflow.id] = movesByWorkflow;
        } else {
          const movesByWorkflow: MovesByWorkflow = auxTreeObjByWorkflowId[move.workflowSubstateTarget.workflowState.workflow.id];
          const movesByState: MovesByState = movesByWorkflow.children.filter(
            (m: MovesByState) => m.id === move.workflowSubstateTarget.workflowState.id
          )[0];
          if (movesByState) {
            if (!move.workflowSubstateTarget.workflowState.front) {
              move.workflowSubstateTarget.move = move;
            }
            movesByState.workflowSubstateTargets.push(move.workflowSubstateTarget);
            if (move.workflowSubstateTarget.workflowState.front) {
              movesByState.workflowSubstateTargets.forEach((wss: WorkflowSubstateDTO) => {
                wss.children = [...wss.workflowSubstateUser].map((user: WorkflowSubstateUserDTO) => {
                  user.name = user.user.fullName;
                  user.move = move;
                  return user;
                });
              });
            }
            movesByState.children = movesByState.workflowSubstateTargets;
          } else {
            if (!move.workflowSubstateTarget.workflowState.front) {
              move.workflowSubstateTarget.move = move;
            }
            //Otro estado diferente al que ya hemos registrado
            const newMoveByState: MovesByState = {
              ...move.workflowSubstateTarget.workflowState,
              workflowSubstateTargets: [move.workflowSubstateTarget],
              children: []
            };
            if (move.workflowSubstateTarget.workflowState.front) {
              newMoveByState.workflowSubstateTargets.forEach((wss: WorkflowSubstateDTO) => {
                wss.children = [...wss.workflowSubstateUser].map((user: WorkflowSubstateUserDTO) => {
                  user.name = this.getUserFullName(user.user);
                  user.move = move;
                  return user;
                });
              });
            }
            newMoveByState.children = newMoveByState.workflowSubstateTargets;
            movesByWorkflow.children.push(newMoveByState);
          }
        }
      });
    }
    Object.keys(auxTreeObjByWorkflowId).forEach((k) => {
      tree.push(auxTreeObjByWorkflowId[k]);
    });
    return tree;
  }

  private getUserFullName(user: UserDTO): string {
    let fullName = '';
    fullName += user.name ? user.name : '';
    fullName += user.firstName ? ' ' + user.firstName : '';
    fullName += user.lastName ? ' ' + user.lastName : '';
    return fullName;
  }
}
