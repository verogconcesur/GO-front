import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';
import WorkflowMoveDto from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDto from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDto from '@data/models/workflows/workflow-substate-user-dto';

@Component({
  selector: 'app-wokflow-board-column',
  templateUrl: './wokflow-board-column.component.html',
  styleUrls: ['./wokflow-board-column.component.scss']
})
export class WokflowBoardColumnComponent implements OnInit, OnChanges {
  @Input() wState: WorkflowStateDto = null;
  @Input() divider = true;
  public collapsed = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public cardsByUserAndSubstate: any = {};
  public readonly wSubstateKey = 'wSubstate-';

  public labels = {
    seeMore: marker('common.seeMore'),
    seeCards: marker('common.seeCards'),
    seeLess: marker('common.seeLess'),
    workers: marker('workflows.peopleWorking'),
    nCards: marker('workflows.numCards'),
    emptySubstate: marker('workflows.emptySubstate')
  };

  constructor() {}

  ngOnInit(): void {
    this.collapsed = this.wState.front;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.wState?.currentValue && this.wState.front) {
      this.wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDto) => {
        wSubstate.workflowSubstateUser.forEach((wUser: WorkflowSubstateUserDto) => {
          this.cardsByUserAndSubstate[wUser.user.id + '-' + wSubstate.id] = [...wSubstate.cards];
        });
      });
      console.log(this.cardsByUserAndSubstate);
    }
  }

  public changeCollapsed() {
    this.collapsed = !this.collapsed;
  }

  public getUserName(wUser: WorkflowSubstateUserDto): string {
    return `${wUser.user.name} ${wUser.user.firstName} ${wUser.user.lastName}`;
  }

  public getCardsFilteredByUser(user: WorkflowSubstateUserDto, cards: WorkflowCardDto[]): WorkflowCardDto[] {
    return cards.filter(
      (card: WorkflowCardDto) => card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId === user.user.id
    );
  }

  public getCollapsedWDroppedClasses(): string {
    let classes = '';
    this.wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDto) => {
      classes += `${this.wSubstateKey}${wSubstate.id} `;
    });
    return classes;
  }

  public getAssociatedWSubstates(card: WorkflowCardDto): string[] {
    const associatedWSubstates: string[] = [];
    if (card?.movements?.length) {
      card.movements.forEach((move: WorkflowMoveDto) => {
        if (move.workflowSubstateTarget.workflowState.front) {
          move.workflowSubstateTarget.workflowSubstateUser.forEach((wUser: WorkflowSubstateUserDto) => {
            associatedWSubstates.push(this.wSubstateKey + move.workflowSubstateTarget.id + '-' + wUser.user.id);
          });
        } else {
          associatedWSubstates.push(this.wSubstateKey + move.workflowSubstateTarget.id);
        }
      });
    }
    return associatedWSubstates;
  }

  public drop(event: CdkDragDrop<string[]>) {
    console.log(event);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }
}
