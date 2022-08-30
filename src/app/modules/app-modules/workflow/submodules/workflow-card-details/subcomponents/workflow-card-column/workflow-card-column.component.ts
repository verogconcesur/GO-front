import { Component, Input, OnInit } from '@angular/core';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { ResponsiveTabI } from '@shared/components/responsive-tabs/responsive-tabs.component';

@Component({
  selector: 'app-workflow-card-column',
  templateUrl: './workflow-card-column.component.html',
  styleUrls: ['./workflow-card-column.component.scss']
})
export class WorkflowCardColumnComponent implements OnInit {
  @Input() column: CardColumnDTO;
  @Input() showTabs = true;
  @Input() containerClass: 'column1' | 'column2' | 'messages' | 'actions' | '' = '';

  public showLoading = false;
  public tabToShow: CardColumnTabDTO = null;

  constructor() {}

  ngOnInit(): void {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getTabsInfo(): { id: any; label: string }[] {
    return [...this.column.tabs].map((tab: CardColumnTabDTO) => ({ id: tab.id, label: tab.name }));
  }

  public tabChange(event: ResponsiveTabI): void {
    this.tabToShow = this.column.tabs.find((tab) => tab.id === event.id);
  }

  public setShowLoading(loading: boolean): void {
    this.showLoading = loading;
  }

  // type     	content_type_id	  content_type	  content_source_id	  content_source
  // CUSTOMIZABLE	  1	            Entidades	          1	                Clientes
  // CUSTOMIZABLE	  1	            Entidades         	2               	Vehículos
  // CUSTOMIZABLE	  1	            Entidades         	3                 Usuarios
  // CUSTOMIZABLE	  1	            Entidades         	6               	Órdenes de reparación
  // CUSTOMIZABLE	  2	            Entidades Extras	  4	                Clientes Extra
  // CUSTOMIZABLE	  2	            Entidades Extras	  5               	Vehículos Extra
  // CUSTOMIZABLE	  3	            Personalizado
  // TEMPLATE	      4	            Presupuesto
  // TEMPLATE	      5	            Adjuntos
  // PREFIXED	      6	            Información
  // PREFIXED	      7	            Historial
  // PREFIXED	      8	            Tareas
  public showColumn(
    column:
      | 'CUSTOMIZABLE_ENTITY'
      | 'CUSTOMIZABLE_CUSTOM'
      | 'TEMPLATE_BUDGETS'
      | 'TEMPLATE_ATTACHMENTS'
      | 'PREFIXED_INFORMATION'
      | 'PREFIXED_HISTORY'
      | 'PREFIXED_TASKS'
  ): boolean {
    if (!this.tabToShow) {
      return false;
    }
    let show = false;
    if (
      column === 'CUSTOMIZABLE_ENTITY' &&
      this.tabToShow.type === 'CUSTOMIZABLE' &&
      (this.tabToShow.contentTypeId === 1 || this.tabToShow.contentTypeId === 2)
    ) {
      show = true;
    } else if (column === 'CUSTOMIZABLE_CUSTOM' && this.tabToShow.type === 'CUSTOMIZABLE' && this.tabToShow.contentTypeId === 3) {
      show = true;
    } else if (column === 'TEMPLATE_BUDGETS' && this.tabToShow.type === 'TEMPLATE' && this.tabToShow.contentTypeId === 4) {
      show = true;
    } else if (column === 'TEMPLATE_ATTACHMENTS' && this.tabToShow.type === 'TEMPLATE' && this.tabToShow.contentTypeId === 5) {
      show = true;
    } else if (column === 'PREFIXED_INFORMATION' && this.tabToShow.type === 'PREFIXED' && this.tabToShow.contentTypeId === 6) {
      show = true;
    } else if (column === 'PREFIXED_HISTORY' && this.tabToShow.type === 'PREFIXED' && this.tabToShow.contentTypeId === 7) {
      show = true;
    } else if (column === 'PREFIXED_TASKS' && this.tabToShow.type === 'PREFIXED' && this.tabToShow.contentTypeId === 8) {
      show = true;
    }
    return show;
  }
}
