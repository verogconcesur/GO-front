/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, HostListener, NgZone, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilityDTO from '@data/models/organization/facility-dto';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowFilterDTO from '@data/models/workflows/workflow-filter-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { WorkflowDragAndDropService } from '../../aux-service/workflow-drag-and-drop.service';
import { WorkflowFilterService } from '../../aux-service/workflow-filter.service';
import { WorkflowPrepareAndMoveService } from '../../aux-service/workflow-prepare-and-move-aux.service';
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

  public facilities: FacilityDTO[] = [];
  public workflow: WorkflowDTO = null;
  public wStatesData: WorkflowStateDTO[];
  public wAnchorState: WorkflowStateDTO;
  public wNormalStates: WorkflowStateDTO[];
  public showAnchorState = true;
  public mouseDown = false;
  public startX: any;
  public scrollLeft: any;
  public cardDragging: boolean;
  public labels = {
    noData: marker('errors.noDataToShow')
  };
  private workflowInstances: WorkflowStateDTO[] = [];
  private filters: WorkflowFilterDTO = null;

  constructor(
    private workflowService: WorkflowsService,
    private workflowFilterService: WorkflowFilterService,
    private spinnerService: ProgressSpinnerDialogService,
    private dragAndDropService: WorkflowDragAndDropService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService
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
    this.workflowService.workflowSelectedSubject$.pipe(untilDestroyed(this)).subscribe((workflow: WorkflowDTO) => {
      this.workflow = workflow;
    });
    this.workflowService.facilitiesSelectedSubject$.pipe(untilDestroyed(this)).subscribe((facilities: FacilityDTO[]) => {
      this.facilities = facilities;
      this.getData();
    });
    this.workflowFilterService.workflowFilterSubject$.pipe(untilDestroyed(this)).subscribe((filter: WorkflowFilterDTO) => {
      this.filters = filter;
      this.filterData();
    });
    this.dragAndDropService.expandedColumns$.pipe(untilDestroyed(this)).subscribe((data: string[]) => {
      //Permite al CDKDrag recalcular y mostrar los place holder donde corresponda
      if (this.scrollColumns?.nativeElement) {
        setTimeout(() => {
          this.scrollColumns.nativeElement.scrollLeft += 1;
        }, 100);
      }
    });
    this.dragAndDropService.draggingCard$.pipe(untilDestroyed(this)).subscribe((data: WorkflowCardDTO) => {
      if (data) {
        this.cardDragging = true;
      } else {
        this.cardDragging = false;
      }
    });
    this.prepareAndMoveService.reloadData$
      .pipe(untilDestroyed(this))
      .subscribe((data: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS') => {
        if (data === 'MOVES_IN_THIS_WORKFLOW') {
          //En caso de que sea en este mismo workflow recargo la pantalla
          this.reloadCardData(+new Date());
          this.prepareAndMoveService.reloadData$.next(null);
        }
      });
  }

  public toggleAnchorState = () => (this.showAnchorState = !this.showAnchorState);

  public reloadCardData(event: number): void {
    const spinner = this.spinnerService.show();
    this.workflowService
      .getWorkflowCards(this.workflow, this.facilities, 'BOARD')
      .pipe(take(1))
      .subscribe((data: WorkflowCardDTO[]) => {
        this.spinnerService.hide(spinner);
        this.mapWorkflowCardsWithInstances(data);
      });
  }

  public hideAnchorState = (): boolean => !this.showAnchorState;

  public startDragging(e: MouseEvent, flag: boolean) {
    this.mouseDown = true;
    this.startX = e.pageX - this.scrollColumns.nativeElement.offsetLeft;
    this.scrollLeft = this.scrollColumns.nativeElement.scrollLeft;
  }

  public stopDragging(e: MouseEvent, flag: boolean) {
    this.mouseDown = false;
  }

  public moveEvent(e: MouseEvent) {
    if (!this.cardDragging && this.mouseDown) {
      e.preventDefault();
      const x = e.pageX - this.scrollColumns.nativeElement.offsetLeft;
      const scroll = x - this.startX;
      this.scrollColumns.nativeElement.scrollLeft = this.scrollLeft - scroll;
    }
  }

  private mapWorkflowCardsWithInstances(workflowCards: WorkflowCardDTO[]) {
    this.workflowInstances.forEach((wState: WorkflowStateDTO) => {
      let totalCards = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalUsers: any = {};
      wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDTO) => {
        wSubstate.cards = this.workflowFilterService.orderCardsByOrderNumber(
          workflowCards.filter((card: WorkflowCardDTO) => card.cardInstanceWorkflows[0].workflowSubstateId === wSubstate.id)
        );
        totalCards += wSubstate.cards.length;
        wSubstate.workflowSubstateUser.forEach((user: WorkflowSubstateUserDTO) => {
          const cardsBySubstateId = totalUsers[user.user.id] ? totalUsers[user.user.id].cardsBySubstateId : {};
          const substateCardsByUser = wSubstate.cards.filter(
            (card: WorkflowCardDTO) => card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId === user.user.id
          );
          user.cards = this.workflowFilterService.orderCardsByOrderNumber([...substateCardsByUser]);
          user.cardsBySubstateId = JSON.parse(JSON.stringify(cardsBySubstateId));
          user.cardsBySubstateId[wSubstate.id] = [...substateCardsByUser];
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
      this.wAnchorState = this.wStatesData.find((state: WorkflowStateDTO) => state.anchor);
      this.wNormalStates = this.wStatesData
        .filter((state: WorkflowStateDTO) => !state.anchor)
        .sort((a, b) => a.orderNumber - b.orderNumber);
    });
  }

  private getData(): void {
    if (this.workflow) {
      const spinner = this.spinnerService.show();
      forkJoin([
        this.workflowService.getWorkflowInstances(this.workflow, this.facilities, 'BOARD', true).pipe(take(1)),
        this.workflowService.getWorkflowCards(this.workflow, this.facilities, 'BOARD').pipe(take(1))
      ]).subscribe(
        (data: [WorkflowStateDTO[], WorkflowCardDTO[]]) => {
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
