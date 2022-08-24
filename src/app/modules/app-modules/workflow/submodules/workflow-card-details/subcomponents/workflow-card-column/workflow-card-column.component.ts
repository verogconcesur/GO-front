import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ResponsiveTabI } from '@shared/components/responsive-tabs/responsive-tabs.component';

@Component({
  selector: 'app-workflow-card-column',
  templateUrl: './workflow-card-column.component.html',
  styleUrls: ['./workflow-card-column.component.scss']
})
export class WorkflowCardColumnComponent implements OnInit {
  @Input() column: 'information' | 'workOrder' | 'messages' | 'actions';
  @Output() tabChangeEvent: EventEmitter<{ column: 'information' | 'workOrder' | 'messages' | 'actions'; tab: ResponsiveTabI }> =
    new EventEmitter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public labels: any = {
    information: marker('common.information'),
    workOrder: marker('common.workOrder'),
    messages: marker('common.messages'),
    actions: marker('common.actions'),
    vehicle: marker('common.vehicle'),
    client: marker('common.client'),
    replacementVehicle: marker('common.replacementVehicle'),
    history: marker('common.history'),
    data: marker('common.data'),
    adviser: marker('common.adviser'),
    budget: marker('common.budget'),
    payments: marker('common.payments'),
    replacements: marker('common.replacements'),
    attachments: marker('common.attachments'),
    tasks: marker('common.tasks'),
    comments: marker('common.comments'),
    clientMessages: marker('common.clientMessages')
  };

  public tabsByColumn = {
    information: ['vehicle', 'client', 'replacementVehicle', 'history'],
    workOrder: ['information', 'data', 'adviser', 'budget', 'payments', 'replacements', 'attachments', 'tasks'],
    messages: ['comments', 'clientMessages']
  };

  constructor() {}

  ngOnInit(): void {}

  public getTabsInfo(column: 'information' | 'workOrder' | 'messages'): { id: string; labelToTranslate: string }[] {
    const tabs: { id: string; labelToTranslate: string }[] = [];
    this.tabsByColumn[column].forEach((tab) => tabs.push({ id: tab, labelToTranslate: this.labels[tab] }));
    return tabs;
  }

  public tabChange(event: ResponsiveTabI): void {
    //La navegación la hago desde el padre para poder controlar todas las columnas
    this.tabChangeEvent.emit({ column: this.column, tab: event });
  }
}
