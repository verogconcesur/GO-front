import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import CardColumnTabDto from '@data/models/cards/card-column-tab-dto';

@Component({
  selector: 'app-workflow-column-templates-attachments',
  templateUrl: './workflow-column-templates-attachments.component.html',
  styleUrls: ['./workflow-column-templates-attachments.component.scss']
})
export class WorkflowColumnTemplatesAttachmentsComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDto = null;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      console.log('tab: ', this.tab);
    }
  }
}
