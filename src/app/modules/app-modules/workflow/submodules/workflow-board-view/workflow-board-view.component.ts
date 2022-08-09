import { Component, HostListener, OnInit } from '@angular/core';
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

@UntilDestroy()
@Component({
  selector: 'app-workflow-board-view',
  templateUrl: './workflow-board-view.component.html',
  styleUrls: ['./workflow-board-view.component.scss']
})
export class WorkflowBoardViewComponent implements OnInit {
  public workflow: WorkflowDto = null;
  public wStatesData: WorkflowStateDto[];
  public wAnchorState: WorkflowStateDto;
  public wNormalStates: WorkflowStateDto[];
  public showAnchorState = true;

  constructor(private workflowService: WorkflowsService, private spinnerService: ProgressSpinnerDialogService) {}

  @HostListener('window:resize', ['$event']) onResize = (event: { target: { innerWidth: number } }) => {
    console.log(event.target.innerWidth, this.showAnchorState);
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
  }

  public toggleAnchorState = () => (this.showAnchorState = !this.showAnchorState);

  private getData(): void {
    if (this.workflow) {
      const spinner = this.spinnerService.show();
      forkJoin([
        this.workflowService.getWorkflowInstances(this.workflow, true).pipe(take(1)),
        this.workflowService.getWorkflowCards(this.workflow, 'BOARD').pipe(take(1))
      ]).subscribe(
        (data: [WorkflowStateDto[], WorkflowCardDto[]]) => {
          this.spinnerService.hide(spinner);
          const workflowInstances: WorkflowStateDto[] = data[0];
          const workflowCards: WorkflowCardDto[] = data[1];

          workflowInstances.forEach((wState: WorkflowStateDto) => {
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

          this.wStatesData = workflowInstances;
          this.wAnchorState = workflowInstances.find((state: WorkflowStateDto) => state.anchor);
          this.wNormalStates = workflowInstances
            .filter((state: WorkflowStateDto) => !state.anchor)
            .sort((a, b) => a.orderNumber - b.orderNumber);
          console.log(this.wAnchorState, this.wNormalStates);
        },
        (errors) => {
          this.spinnerService.hide(spinner);
          console.log(errors);
        }
      );
    }
  }
}
