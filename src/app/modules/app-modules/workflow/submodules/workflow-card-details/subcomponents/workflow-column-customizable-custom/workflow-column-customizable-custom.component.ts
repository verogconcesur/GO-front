import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import CardColumnTabDto from '@data/models/cards/card-column-tab-dto';

@Component({
  selector: 'app-workflow-column-customizable-custom',
  templateUrl: './workflow-column-customizable-custom.component.html',
  styleUrls: ['./workflow-column-customizable-custom.component.scss']
})
export class WorkflowColumnCustomizableCustomComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDto = null;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      console.log('tab: ', this.tab);
    }
  }
}
