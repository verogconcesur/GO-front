import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import CardColumnTabDto from '@data/models/cards/card-column-tab-dto';

@Component({
  selector: 'app-workflow-column-templates-budgets',
  templateUrl: './workflow-column-templates-budgets.component.html',
  styleUrls: ['./workflow-column-templates-budgets.component.scss']
})
export class WorkflowColumnTemplatesBudgetsComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDto = null;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      console.log('tab: ', this.tab);
    }
  }
}
