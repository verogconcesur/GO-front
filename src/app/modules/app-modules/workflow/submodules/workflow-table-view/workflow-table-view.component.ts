import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ChildActivationEnd } from '@angular/router';
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
import { WorkflowFilterService } from '../../aux-service/workflow-filter.service';
import { WorkflowPrepareAndMoveService } from '../../aux-service/workflow-prepare-and-move-aux.service';
@UntilDestroy()
@Component({
  selector: 'app-workflow-table-view',
  templateUrl: './workflow-table-view.component.html',
  styleUrls: ['./workflow-table-view.component.scss']
})
export class WorkflowTableViewComponent implements OnInit {
  public showListView = true;
  public facilities: FacilityDTO[] = [];
  public workflow: WorkflowDTO = null;
  public loadedData: { workflow: WorkflowDTO; facilities: FacilityDTO[] };
  public wStatesData: WorkflowStateDTO[];
  public wAnchorState: WorkflowStateDTO;
  public wNormalStates: WorkflowStateDTO[];
  public showAnchorState = true;
  public labels = {
    noData: marker('errors.noDataToShow')
  };
  private workflowInstances: WorkflowStateDTO[] = [];
  private filters: WorkflowFilterDTO = null;

  constructor(
    private workflowService: WorkflowsService,
    private workflowFilterService: WorkflowFilterService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,
    private router: Router
  ) {}

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
    this.prepareAndMoveService.reloadData$
      .pipe(untilDestroyed(this))
      .subscribe((data: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS') => {
        if (data === 'MOVES_IN_THIS_WORKFLOW' || data === 'MOVES_IN_OTHER_WORKFLOWS') {
          this.reloadCardData(+new Date());
          this.prepareAndMoveService.reloadData$.next(null);
        }
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.router.events.pipe(untilDestroyed(this)).subscribe((event: any) => {
      if (event instanceof NavigationEnd || event instanceof ChildActivationEnd) {
        if (this.router.url.indexOf('(card:wcId') > 0 && this.showListView) {
          console.log('Hide board view');
          this.showListView = false;
        } else if (this.router.url.indexOf('(card:wcId') === -1 && !this.showListView) {
          console.log('Show board view');
          this.showListView = true;
        }
      }
    });
  }
  public reloadCardData(event: number): void {
    const spinner = this.spinnerService.show();

    this.workflowService
      .getWorkflowCards(this.workflow, this.facilities, 'TABLE')
      .pipe(take(1))
      .subscribe((data: WorkflowCardDTO[]) => {
        this.spinnerService.hide(spinner);
        this.mapWorkflowCardsWithInstances(data);
      });
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
        wSubstate.cards = wSubstate.cards.map((card) => {
          const subStateCopy = lodash.cloneDeep(wSubstate);
          //Rompo la recursividad
          subStateCopy.cards = [];
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
    setTimeout(() => {
      this.wAnchorState = this.wStatesData.find((state: WorkflowStateDTO) => state.anchor);
      this.wNormalStates = this.wStatesData
        .filter((state: WorkflowStateDTO) => !state.anchor)
        .sort((a, b) => a.orderNumber - b.orderNumber);
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
      forkJoin([
        this.workflowService.getWorkflowInstances(this.workflow, this.facilities, 'TABLE', true).pipe(take(1)),
        this.workflowService.getWorkflowCards(this.workflow, this.facilities, 'TABLE').pipe(take(1))
      ]).subscribe(
        (data: [WorkflowStateDTO[], WorkflowCardDTO[]]) => {
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
