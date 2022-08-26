import { Component, Input, OnInit } from '@angular/core';
import CardColumnTabDto from '@data/models/cards/card-column-tab-dto';

@Component({
  selector: 'app-workflow-card-header',
  templateUrl: './workflow-card-header.component.html',
  styleUrls: ['./workflow-card-header.component.scss']
})
export class WorkflowCardHeaderComponent implements OnInit {
  @Input() tab: CardColumnTabDto = null;

  constructor() {}

  ngOnInit(): void {}
}
