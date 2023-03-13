/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChildActivationEnd, NavigationEnd, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';
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
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { haveArraysSameValuesIdObjects } from '@shared/utils/array-comparation-function';
import lodash from 'lodash';
import { NGXLogger } from 'ngx-logger';
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
  public showBoardView = true;
  public facilities: FacilityDTO[] = [];
  public workflow: WorkflowDTO = null;
  public wStatesData: WorkflowStateDTO[];
  public wAnchorState: WorkflowStateDTO;
  public wNormalStates: WorkflowStateDTO[];
  public loadedData: { workflow: WorkflowDTO; facilities: FacilityDTO[] };
  public showAnchorState = true;
  public mouseDown = false;
  public startX: any;
  public scrollLeft: any;
  public cardDragging: boolean;
  public labels = {
    noData: marker('errors.noDataToShow')
  };
  public isDragAndDropEnabled: boolean;
  private workflowInstances: WorkflowStateDTO[] = [];
  private filters: WorkflowFilterDTO = null;
  // private askForDataTimeStamp: number;
  // private getDataTimeStamp: number;
  // private renderedDataTimeStamp: number;

  constructor(
    private workflowService: WorkflowsService,
    private workflowFilterService: WorkflowFilterService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private dragAndDropService: WorkflowDragAndDropService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,

    private router: Router
  ) {}

  @HostListener('window:resize', ['$event']) onResize = (event: { target: { innerWidth: number } }) => {
    if (event.target.innerWidth >= 1300 && !this.showAnchorState) {
      this.showAnchorState = true;
    }
  };

  ngOnInit(): void {
    this.isDragAndDropEnabled = this.dragAndDropService.isDragAndDropEnabled();
    //Sólo inicializamos listeners si tenemos seleccionad un workflow (tenemos wId en la url)
    if (this.router.url.indexOf(`${RouteConstants.WORKFLOWS}/${RouteConstants.WORKFLOWS_BOARD_VIEW}`) === -1) {
      this.initListeners();
    }
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
    if (this.isDragAndDropEnabled) {
      this.dragAndDropService.draggingCard$.pipe(untilDestroyed(this)).subscribe((data: WorkflowCardDTO) => {
        if (data) {
          this.cardDragging = true;
        } else {
          this.cardDragging = false;
        }
      });
    }
    this.prepareAndMoveService.reloadData$
      .pipe(untilDestroyed(this))
      .subscribe((data: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS') => {
        if (data === 'MOVES_IN_THIS_WORKFLOW' || data === 'MOVES_IN_OTHER_WORKFLOWS') {
          this.reloadCardData(+new Date());
          this.prepareAndMoveService.reloadData$.next(null);
        }
      });

    this.router.events.pipe(untilDestroyed(this)).subscribe((event: any) => {
      if (event instanceof NavigationEnd || event instanceof ChildActivationEnd) {
        if (this.router.url.indexOf('(card:wcId') > 0 && this.showBoardView) {
          console.log('Hide board view');
          this.showBoardView = false;
        } else if (this.router.url.indexOf('(card:wcId') === -1 && !this.showBoardView) {
          console.log('Show board view');
          this.showBoardView = true;
        }
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
        const subStateCopy = lodash.cloneDeep(wSubstate); //Rompo la recursividad
        subStateCopy.cards = [];
        wSubstate.cards = wSubstate.cards.map((card) => {
          card.workflowSubstate = subStateCopy;
          return card;
        });
        totalCards += wSubstate.cards.length;
        wSubstate.workflowSubstateUser.forEach((user: WorkflowSubstateUserDTO) => {
          const cardsBySubstateId = totalUsers[user.user.id] ? totalUsers[user.user.id].cardsBySubstateId : {};
          const substateCardsByUser = wSubstate.cards
            .filter((card: WorkflowCardDTO) => card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId === user.user.id)
            //Rompo recursividad
            .map((card) => ({
              ...card,
              workflowSubstate: {
                ...card.workflowSubstate,
                workflowSubstateEvents: [],
                workflowState: null,
                workflowSubstateUser: []
              }
            }));
          user.cards = this.workflowFilterService.orderCardsByOrderNumber([...substateCardsByUser]);
          user.cardsBySubstateId = lodash.cloneDeep(cardsBySubstateId);
          user.cardsBySubstateId[wSubstate.id] = user.cards;
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
    setTimeout(() => {
      this.wAnchorState = this.wStatesData.find((state: WorkflowStateDTO) => state.anchor);
      this.wNormalStates = this.wStatesData
        .filter((state: WorkflowStateDTO) => !state.anchor)
        .sort((a, b) => a.orderNumber - b.orderNumber);
      // if (this.getDataTimeStamp) {
      //   this.renderedDataTimeStamp = +new Date();
      //   console.log('############ TERMINO DE PREPARAR DATOS FRONT', this.renderedDataTimeStamp);
      //   console.log('####### TIEMPO EN PREPARAR DATOS FRONT=> ', this.renderedDataTimeStamp - this.getDataTimeStamp);
      //   console.log('####### TIEMPO TOTAL CONSUMIDO=> ', this.renderedDataTimeStamp - this.askForDataTimeStamp);

      //   this.renderedDataTimeStamp = null;
      //   this.getDataTimeStamp = null;
      // }
    });
  }

  private getData(): void {
    if (
      this.workflow &&
      (!this.loadedData ||
        this.workflow.id !== this.loadedData.workflow.id ||
        !haveArraysSameValuesIdObjects(this.loadedData.facilities, this.facilities))
    ) {
      this.loadedData = { workflow: this.workflow, facilities: this.facilities };
      const spinner = this.spinnerService.show();
      // this.askForDataTimeStamp = +new Date();
      // console.log('############ PIDO DATOS A BACK', this.askForDataTimeStamp);
      forkJoin([
        this.workflowService.getWorkflowInstances(this.workflow, this.facilities, 'BOARD', true).pipe(take(1)),
        this.workflowService.getWorkflowCards(this.workflow, this.facilities, 'BOARD').pipe(take(1))
      ]).subscribe(
        (data: [WorkflowStateDTO[], WorkflowCardDTO[]]) => {
          // this.getDataTimeStamp = +new Date();
          // console.log('############ PETICIÓN BACK HA TARDADO: ', this.getDataTimeStamp - this.askForDataTimeStamp);
          // console.log('############ YA TENGO LOS DATOS EN FRONT', this.getDataTimeStamp);
          this.spinnerService.hide(spinner);
          this.workflowInstances = data[0];
          this.mapWorkflowCardsWithInstances(data[1]);
        },
        (error: ConcenetError) => {
          this.spinnerService.hide(spinner);
          this.workflowInstances = [];
          this.mapWorkflowCardsWithInstances([]);
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
