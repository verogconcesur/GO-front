import { Component, ElementRef, HostListener, NgZone, OnInit, ViewChild } from '@angular/core';
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
import { WorkflowFilterService } from '../../aux-service/workflow-filter.service';
import { WokflowBoardColumnComponent } from './subcomponents/wokflow-board-column/wokflow-board-column.component';

@UntilDestroy()
@Component({
  selector: 'app-workflow-board-view',
  templateUrl: './workflow-board-view.component.html',
  styleUrls: ['./workflow-board-view.component.scss']
})
export class WorkflowBoardViewComponent implements OnInit {
  @ViewChild('ScrollColumns') scrollColumns: ElementRef;
  @ViewChild('AnchorColumn') anchorColumns: ElementRef;
  @ViewChild('AnchorStateColumn') anchorStateColumn: WokflowBoardColumnComponent;

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
  private filters: WorkflowFilterDto = null;

  constructor(
    private workflowService: WorkflowsService,
    private workflowFilterService: WorkflowFilterService,
    private spinnerService: ProgressSpinnerDialogService,
    private dragAndDropService: WorkflowDragAndDropService,
    private zone: NgZone
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
    this.workflowFilterService.workflowFilterSubject$.pipe(untilDestroyed(this)).subscribe((filter: WorkflowFilterDto) => {
      this.filters = filter;
      this.filterData();
    });
    this.dragAndDropService.draggingCard$.pipe(untilDestroyed(this)).subscribe((dragging: boolean) => {
      this.draggingACard = dragging;
    });
    this.dragAndDropService.expandedColumns$.pipe(untilDestroyed(this)).subscribe((data: string[]) => {
      //Permite al CDKDrag recalcular y mostrar los place holder donde corresponda
      if (this.scrollColumns?.nativeElement) {
        setTimeout(() => {
          this.scrollColumns.nativeElement.scrollLeft += 1;
        }, 100);
      }
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

  public hideAnchorState = (): boolean => !this.showAnchorState || this.anchorStateColumn?.isStateEmpty();

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
          const cardsBySubstateId = totalUsers[user.user.id] ? totalUsers[user.user.id].cardsBySubstateId : {};
          const oldCards = totalUsers[user.user.id] ? totalUsers[user.user.id].cards : [];
          const newCards = wSubstate.cards.filter(
            (card: WorkflowCardDto) => card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId === user.user.id
          );
          user.cards = [...newCards];
          user.cardsBySubstateId = JSON.parse(JSON.stringify(cardsBySubstateId));
          user.cardsBySubstateId[wSubstate.id] = [...newCards];
          totalUsers[user.user.id] = user;
        });
      });
      wState.cardCount = totalCards;
      wState.userCount = Object.keys(totalUsers).length;
      wState.workflowUsers = Object.keys(totalUsers).map((k) => totalUsers[k]);
    });
    this.filterData();
  }

  private filterData() {
    this.wStatesData = this.workflowFilterService.filterData(this.workflowInstances, this.filters);
    this.defineColumns();
  }

  private defineColumns() {
    // this.wAnchorState = null;
    // this.wNormalStates = [];
    setTimeout(() => {
      this.wAnchorState = this.wStatesData.find((state: WorkflowStateDto) => state.anchor);
      this.wNormalStates = this.wStatesData
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
