import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';

@Component({
  selector: 'app-workflow-table-state',
  templateUrl: './workflow-table-state.component.html',
  styleUrls: ['./workflow-table-state.component.scss']
})
export class WorkflowTableStateComponent implements OnInit {
  @Input() workflow: WorkflowDTO = null;
  @Input() wState: WorkflowStateDTO = null;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  public labels = {
    collapse: marker('common.collapse'),
    expand: marker('common.expand'),
    noData: marker('errors.noDataToShow'),
    workers: marker('workflows.peopleWorking'),
    nCards: marker('workflows.numCards')
  };
  constructor() {}

  ngOnInit(): void {}
}
