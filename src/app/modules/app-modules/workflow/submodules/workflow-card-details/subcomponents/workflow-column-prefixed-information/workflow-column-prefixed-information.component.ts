import { Component, Input, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';

@Component({
  selector: 'app-workflow-column-prefixed-information',
  templateUrl: './workflow-column-prefixed-information.component.html',
  styleUrls: ['./workflow-column-prefixed-information.component.scss']
})
export class WorkflowColumnPrefixedInformationComponent implements OnInit {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;

  public labels = {
    workOrderInformation: marker('workflows.workOrderInformation'),
    createdOn: marker('common.createdOn'),
    origin: marker('common.origin'),
    taskDescription: marker('workflows.taskDescription')
  };

  constructor() {}

  ngOnInit(): void {}
}
