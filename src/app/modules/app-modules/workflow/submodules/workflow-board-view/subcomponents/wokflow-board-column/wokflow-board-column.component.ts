import { Component, Input, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';

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
    seeLess: marker('common.seeLess')
  };

  constructor() {}

  ngOnInit(): void {
    this.collapsed = this.wState.front;
  }

  public changeCollapsed() {
    this.collapsed = !this.collapsed;
  }
}
