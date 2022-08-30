import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';

@Component({
  selector: 'app-workflow-column-prefixed-history',
  templateUrl: './workflow-column-prefixed-history.component.html',
  styleUrls: ['./workflow-column-prefixed-history.component.scss']
})
export class WorkflowColumnPrefixedHistoryComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      console.log('tab: ', this.tab);
    }
  }
}
