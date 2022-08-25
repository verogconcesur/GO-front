import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import CardColumnTabDto from '@data/models/cards/card-column-tab-dto';

@Component({
  selector: 'app-workflow-column-customizable-entity',
  templateUrl: './workflow-column-customizable-entity.component.html',
  styleUrls: ['./workflow-column-customizable-entity.component.scss']
})
export class WorkflowColumnCustomizableEntityComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDto = null;

  constructor() {
    console.log('Constructor WorkflowColumnCustomizableEntityComponent');
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      console.log('tab: ', this.tab);
    }
  }
}
