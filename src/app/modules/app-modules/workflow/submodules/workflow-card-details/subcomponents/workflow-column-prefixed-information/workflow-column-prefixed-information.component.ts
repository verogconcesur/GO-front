import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import CardColumnTabDto from '@data/models/cards/card-column-tab-dto';

@Component({
  selector: 'app-workflow-column-prefixed-information',
  templateUrl: './workflow-column-prefixed-information.component.html',
  styleUrls: ['./workflow-column-prefixed-information.component.scss']
})
export class WorkflowColumnPrefixedInformationComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDto = null;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      console.log('tab: ', this.tab);
    }
  }
}
