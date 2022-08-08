import { Component, OnInit } from '@angular/core';
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

  constructor(private workflowService: WorkflowsService, private spinnerService: ProgressSpinnerDialogService) {}

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
          //DGDC TODO: quitar parte hardcode
          const workflowCards: WorkflowCardDto[] = data[1].map((card, i) => ({
            ...card,
            substateId: 2,
            userId: i % 2 === 0 ? 2 : 3
          }));

          workflowInstances.forEach((wState: WorkflowStateDto) => {
            let totalCards = 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalUsers: any = {};
            wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDto) => {
              wSubstate.cards = workflowCards.filter((card: WorkflowCardDto) => card.substateId === wSubstate.id);
              totalCards += wSubstate.cards.length;
              wSubstate.workflowSubstateUser.forEach((user: WorkflowSubstateUserDto) => {
                totalUsers[user.workflowUserId] = true;
                user.cards = wSubstate.cards.filter((card: WorkflowCardDto) => card.userId === user.workflowUserId);
              });
            });
            wState.cardCount = totalCards;
            wState.userCount = Object.keys(totalUsers).length;
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
