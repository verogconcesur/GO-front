import { Component, Input, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateUserDto from '@data/models/workflows/workflow-substate-user-dto';

@Component({
  selector: 'app-wokflow-board-column',
  templateUrl: './wokflow-board-column.component.html',
  styleUrls: ['./wokflow-board-column.component.scss']
})
export class WokflowBoardColumnComponent implements OnInit {
  @Input() wState: WorkflowStateDto = null;
  @Input() divider = true;
  public collapsed = true;

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

  public changeCollapsed() {
    this.collapsed = !this.collapsed;
  }

  public getUserName(wUser: WorkflowSubstateUserDto): string {
    return `${wUser.user.name} ${wUser.user.firstName} ${wUser.user.lastName}`;
  }

  public getCardsFiltertedByUser(user: WorkflowSubstateUserDto, cards: WorkflowCardDto[]): WorkflowCardDto[] {
    return cards.filter(
      (card: WorkflowCardDto) => card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId === user.user.id
    );
  }
}
