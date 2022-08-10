import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';
import WorkflowDto from '@data/models/workflows/workflow-dto';
import WorkflowFilterDto from '@data/models/workflows/workflow-filter-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDto from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDto from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { WorkflowDragAndDropService } from '../../aux-service/workflow-drag-and-drop.service';

@UntilDestroy()
@Component({
  selector: 'app-workflow-board-view',
  templateUrl: './workflow-board-view.component.html',
  styleUrls: ['./workflow-board-view.component.scss']
})
export class WorkflowBoardViewComponent implements OnInit {
  @ViewChild('ScrollColumns') scrollColumns: ElementRef;
  @ViewChild('AnchorColumn') anchorColumns: ElementRef;
  public workflow: WorkflowDto = null;
  public wStatesData: WorkflowStateDto[];
  public wAnchorState: WorkflowStateDto;
  public wNormalStates: WorkflowStateDto[];
  public showAnchorState = true;
  private moveHorizontalScrollTo: 'LEFT' | 'NEUTRAL' | 'RIGHT' = 'NEUTRAL';
  private horizontalScrollEndLoop = false;
  private horizontalScrollZoneInPx = 200;
  private draggingACard = false;
  private workflowInstances: WorkflowStateDto[] = [];

  constructor(
    private workflowService: WorkflowsService,
    private spinnerService: ProgressSpinnerDialogService,
    private dragAndDropService: WorkflowDragAndDropService
  ) {}

  @HostListener('window:resize', ['$event']) onResize = (event: { target: { innerWidth: number } }) => {
    if (event.target.innerWidth >= 1300 && !this.showAnchorState) {
      this.showAnchorState = true;
    }
  };

  ngOnInit(): void {
    this.initListeners();
  }

  public initListeners(): void {
    this.workflowService.workflowSelectedSubject$.pipe(untilDestroyed(this)).subscribe((workflow: WorkflowDto) => {
      this.workflow = workflow;
      this.getData();
    });
    this.workflowService.workflowFilterSubject$.pipe(untilDestroyed(this)).subscribe((filter: WorkflowFilterDto) => {
      console.log('Hay cambios en los filtros: ', filter);
    });
    this.dragAndDropService.draggingCard$.pipe(untilDestroyed(this)).subscribe((dragging: boolean) => {
      this.draggingACard = dragging;
    });
  }

  public toggleAnchorState = () => (this.showAnchorState = !this.showAnchorState);

  public mouseOver = (event: MouseEvent, loop?: boolean): void => {
    if (!this.anchorColumns || !this.scrollColumns) {
      return;
    }
    if (
      this.draggingACard &&
      event.clientX >= this.anchorColumns.nativeElement.offsetWidth &&
      event.clientX <= this.anchorColumns.nativeElement.offsetWidth + this.horizontalScrollZoneInPx &&
      this.scrollColumns.nativeElement.scrollLeft !== 0
    ) {
      if (
        (this.moveHorizontalScrollTo === 'NEUTRAL' && !loop) ||
        (this.moveHorizontalScrollTo === 'LEFT' && loop && !this.horizontalScrollEndLoop)
      ) {
        if (this.moveHorizontalScrollTo === 'NEUTRAL') {
          this.horizontalScrollEndLoop = false;
        }
        this.moveHorizontalScrollTo = 'LEFT';
        this.scrollColumns.nativeElement.scrollLeft -= 4;
        setTimeout(() => {
          this.mouseOver(event, true);
        }, 5);
      }
    } else if (this.draggingACard && event.clientX >= window.innerWidth - this.horizontalScrollZoneInPx) {
      if (
        (this.moveHorizontalScrollTo === 'NEUTRAL' && !loop) ||
        (this.moveHorizontalScrollTo === 'RIGHT' && loop && !this.horizontalScrollEndLoop)
      ) {
        if (this.moveHorizontalScrollTo === 'NEUTRAL') {
          this.horizontalScrollEndLoop = false;
        }
        this.moveHorizontalScrollTo = 'RIGHT';
        this.scrollColumns.nativeElement.scrollLeft += 4;
        setTimeout(() => {
          this.mouseOver(event, true);
        }, 5);
      }
    } else {
      this.moveHorizontalScrollTo = 'NEUTRAL';
      this.horizontalScrollEndLoop = true;
    }
  };

  public reloadCardData(): void {
    const spinner = this.spinnerService.show();
    this.workflowService
      .getWorkflowCards(this.workflow, 'BOARD')
      .pipe(take(1))
      .subscribe((data: WorkflowCardDto[]) => {
        this.spinnerService.hide(spinner);
        this.mapWorkflowCardsWithInstances(data);
      });
  }

  private mapWorkflowCardsWithInstances(workflowCards: WorkflowCardDto[]) {
    this.workflowInstances.forEach((wState: WorkflowStateDto) => {
      let totalCards = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalUsers: any = {};
      wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDto) => {
        wSubstate.cards = workflowCards.filter(
          (card: WorkflowCardDto) => card.cardInstanceWorkflows[0].workflowSubstateId === wSubstate.id
        );
        totalCards += wSubstate.cards.length;
        wSubstate.workflowSubstateUser.forEach((user: WorkflowSubstateUserDto) => {
          totalUsers[user.user.id] = user;
          user.cards = wSubstate.cards.filter(
            (card: WorkflowCardDto) => card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId === user.user.id
          );
        });
      });
      wState.cardCount = totalCards;
      wState.userCount = Object.keys(totalUsers).length;
      wState.workflowUsers = Object.keys(totalUsers).map((k) => totalUsers[k]);
    });

    this.wStatesData = this.workflowInstances;
    this.wAnchorState = null;
    this.wNormalStates = [];
    setTimeout(() => {
      this.wAnchorState = this.workflowInstances.find((state: WorkflowStateDto) => state.anchor);
      this.wNormalStates = this.workflowInstances
        .filter((state: WorkflowStateDto) => !state.anchor)
        .sort((a, b) => a.orderNumber - b.orderNumber);
    });
  }

  private getData(): void {
    if (this.workflow) {
      const spinner = this.spinnerService.show();
      forkJoin([
        this.workflowService.getWorkflowInstances(this.workflow, true).pipe(take(1)),
        this.workflowService.getWorkflowCards(this.workflow, 'BOARD').pipe(take(1))
      ]).subscribe(
        (data: [WorkflowStateDto[], WorkflowCardDto[]]) => {
          this.spinnerService.hide(spinner);
          this.workflowInstances = data[0];
          this.mapWorkflowCardsWithInstances(data[1]);
        },
        (errors) => {
          this.spinnerService.hide(spinner);
          console.log(errors);
        }
      );
    }
  }
}
