import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';
import WorkflowDto from '@data/models/workflows/workflow-dto';
import WorkflowMoveDto from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDto from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDto from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { WorkflowDragAndDropService } from '@modules/app-modules/workflow/aux-service/workflow-drag-and-drop.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-wokflow-board-column',
  templateUrl: './wokflow-board-column.component.html',
  styleUrls: ['./wokflow-board-column.component.scss']
})
export class WokflowBoardColumnComponent implements OnInit {
  @Input() workflow: WorkflowDto = null;
  @Input() wState: WorkflowStateDto = null;
  @Input() divider = true;
  @Output() reloadCardsEvent: EventEmitter<boolean> = new EventEmitter();
  public collapsed = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public hideEmptyDropZone: any = {};
  public isCardDragging = false;
  public droppableStates: string[] = [];
  public changeCollapseStatusOnOver = false;
  public readonly wStateKey = 'wState-';
  public readonly wSubstateKey = 'wSubstate-';
  public readonly droppableZoneClass = 'droppable-zone';
  public readonly timeToWaitBeforeExpandColumnOnDragging = 1500;

  public labels = {
    seeMore: marker('common.seeMore'),
    seeCards: marker('common.seeCards'),
    seeLess: marker('common.seeLess'),
    workers: marker('workflows.peopleWorking'),
    nCards: marker('workflows.numCards'),
    emptySubstate: marker('workflows.emptySubstate')
  };

  constructor(
    public workflowService: WorkflowsService,
    private dragAndDropService: WorkflowDragAndDropService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.collapsed = this.wState.front;
    const id = `${this.wStateKey}${this.wState.id}`;
    if (this.dragAndDropService.isColumnExpanded(id)) {
      this.collapsed = false;
    }
    this.initListeners();
  }

  public initListeners(): void {
    this.dragAndDropService.draggingCard$.pipe(untilDestroyed(this)).subscribe((dragging: boolean) => {
      this.isCardDragging = dragging;
    });
    this.dragAndDropService.droppableStates$.pipe(untilDestroyed(this)).subscribe((droppableStates: string[]) => {
      this.droppableStates = droppableStates;
    });
  }

  public changeCollapsed() {
    this.collapsed = !this.collapsed;
    const id = `${this.wStateKey}${this.wState.id}`;
    if (this.collapsed) {
      this.dragAndDropService.removeExpandedColumn(id);
    } else {
      this.dragAndDropService.addExpandedColumn(id);
    }
  }

  public isStateEmpty(): boolean {
    let isEmpty = true;
    this.wState.workflowSubstates.forEach((wss: WorkflowSubstateDto) => {
      if (wss.cards.length) {
        isEmpty = false;
      }
    });
    return isEmpty;
  }

  public setHideEmptyDropZone(id: string, value: boolean) {
    this.hideEmptyDropZone[id] = value;
  }

  public getHideEmptyDropZone(id: string) {
    return this.hideEmptyDropZone[id];
  }

  public getUserName(wUser: WorkflowSubstateUserDto): string {
    return `${wUser.user.name} ${wUser.user.firstName} ${wUser.user.lastName}`;
  }

  public getCardsFilteredByUser(user: WorkflowSubstateUserDto, cards: WorkflowCardDto[]): WorkflowCardDto[] {
    return cards.filter(
      (card: WorkflowCardDto) => card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId === user.user.id
    );
  }

  public getWSubstatesToShowByUser(user: WorkflowSubstateUserDto, wState: WorkflowStateDto): WorkflowSubstateDto[] {
    return wState.workflowSubstates.filter((wss: WorkflowSubstateDto) => user.cardsBySubstateId[wss.id]);
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

  public getCollapsedDropZoneClass(): string {
    let classes = '';
    this.wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDto) => {
      const sClass = `${this.wSubstateKey}${wSubstate.id}`;
      if (
        this.isCardDragging &&
        classes.indexOf(this.droppableZoneClass) === -1 &&
        this.droppableStates.filter((id: string) => id.indexOf(sClass) === 0).length
      ) {
        classes += `${this.droppableZoneClass} `;
      }
    });
    return classes;
  }

  public getCollapsedWDroppedClasses(): string {
    let classes = '';
    this.wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDto) => {
      classes += `${this.wSubstateKey}${wSubstate.id} `;
    });
    return classes;
  }

  public getCardWrapperClasses(id: string): string {
    let classes = '';
    if (this.isCardDragging) {
      if (this.droppableStates.indexOf(id) >= 0) {
        classes += this.droppableZoneClass;
      }
    }
    return classes;
  }

  public mouseOverCollapsedCard(event: MouseEvent, action: 'over' | 'leave') {
    if (this.getCollapsedDropZoneClass() && action === 'over') {
      this.changeCollapseStatusOnOver = true;
      setTimeout(() => {
        if (this.changeCollapseStatusOnOver && this.collapsed) {
          const id = `${this.wStateKey}${this.wState.id}`;
          this.collapsed = false;
          this.dragAndDropService.addExpandedColumn(id);
        }
      }, this.timeToWaitBeforeExpandColumnOnDragging);
    } else {
      this.changeCollapseStatusOnOver = false;
    }
  }

  public drop(event: CdkDragDrop<string[]>, wSubState: WorkflowSubstateDto, user: WorkflowSubstateUserDto) {
    console.log(event);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item: any = event.previousContainer.data[event.previousIndex];
      const move: WorkflowMoveDto = item.movements.find(
        (wMove: WorkflowMoveDto) => wMove.workflowSubstateTarget.id === wSubState.id
      );
      // transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.workflowService
        .moveWorkflowCardToSubstate(this.workflow.facility.facilityId, item, move, user)
        .pipe(take(1))
        .subscribe(
          (data) => {
            this.reloadCardsEvent.emit(true);
          },
          (error) => {
            this.logger.error(error);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }
}
