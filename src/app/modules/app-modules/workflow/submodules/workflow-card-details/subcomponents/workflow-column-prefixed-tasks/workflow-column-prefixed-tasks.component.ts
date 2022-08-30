import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';

@Component({
  selector: 'app-workflow-column-prefixed-tasks',
  templateUrl: './workflow-column-prefixed-tasks.component.html',
  styleUrls: ['./workflow-column-prefixed-tasks.component.scss']
})
export class WorkflowColumnPrefixedTasksComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      console.log('tab: ', this.tab);
    }
  }
}
