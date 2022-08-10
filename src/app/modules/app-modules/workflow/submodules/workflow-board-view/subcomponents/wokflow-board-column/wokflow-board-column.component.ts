import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';
import WorkflowMoveDto from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDto from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDto from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { timingSafeEqual } from 'crypto';
import { NGXLogger } from 'ngx-logger';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-wokflow-board-column',
  templateUrl: './wokflow-board-column.component.html',
  styleUrls: ['./wokflow-board-column.component.scss']
})
export class WokflowBoardColumnComponent implements OnInit, OnChanges {
  @Input() wState: WorkflowStateDto = null;
  @Input() divider = true;
  @Output() reloadCardsEvent: EventEmitter<boolean> = new EventEmitter();
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

  constructor(
    private workflowService: WorkflowsService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.collapsed = this.wState.front;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('CHANGES', changes);
    if (changes.wState?.currentValue && this.wState.front) {
      this.wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDto) => {
        wSubstate.workflowSubstateUser.forEach((wUser: WorkflowSubstateUserDto) => {
          this.cardsByUserAndSubstate[wUser.user.id + '-' + wSubstate.id] = of([...wUser.cards]);
        });
      });
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
        .moveWorkflowCardToSubstate(item, move, user)
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
