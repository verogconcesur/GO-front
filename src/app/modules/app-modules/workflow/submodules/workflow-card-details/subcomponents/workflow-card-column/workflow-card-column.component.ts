import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowPrepareAndMoveService } from '@modules/app-modules/workflow/aux-service/workflow-prepare-and-move-aux.service';
import { WorkflowRequiredFieldsAuxService } from '@modules/app-modules/workflow/aux-service/workflow-required-fields-aux.service';
import { TranslateService } from '@ngx-translate/core';
import { ResponsiveTabI } from '@shared/components/responsive-tabs/responsive-tabs.component';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-card-column',
  templateUrl: './workflow-card-column.component.html',
  styleUrls: ['./workflow-card-column.component.scss']
})
export class WorkflowCardColumnComponent implements OnInit {
  @Input() cardInstance: CardInstanceDTO;
  @Input() column: CardColumnDTO;
  @Input() showTabs = true;
  @Input() containerClass: 'column1' | 'column2' | 'messages' | 'actions' | '' = '';
  @Input() idUser: number = null;
  @Output() newCommentsEvent: EventEmitter<{ newData: boolean; column: 'COMMENTS' | 'CLIENT_MESSAGES' }> = new EventEmitter(null);

  public showLoading = false;
  public synchronizingData = false;
  public tabToShow: CardColumnTabDTO = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public tabsInfo: { id: any; label: string; newData: boolean; type: string; colId: number }[] = [];

  constructor(
    public requiredFieldsAuxService: WorkflowRequiredFieldsAuxService,
    private cardService: CardService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,
    private confirmationDialog: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {}

  ngOnInit(): void {
    this.tabsInfo = [...this.column.tabs].map((tab: CardColumnTabDTO) => ({
      id: tab.id,
      label: tab.name,
      newData: false,
      type: tab.type,
      colId: this.column.id
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getTabsInfo(): { id: any; label: string; newData: boolean }[] {
    return this.tabsInfo;
  }

  public tabChange(event: ResponsiveTabI): void {
    this.tabToShow = this.column.tabs.find((tab) => tab.id === event.id);
  }

  public setShowLoading(loading: boolean): void {
    this.showLoading = loading;
  }

  public newComments(newData: boolean, column: 'COMMENTS' | 'CLIENT_MESSAGES'): void {
    this.tabsInfo.forEach((tab) => {
      if (tab.type === column) {
        tab.newData = newData;
      }
    });
    this.newCommentsEvent.emit({ newData, column });
  }

  public syncData(): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('workflows.card.syncData'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.synchronizingData = true;
          this.cardService
            .syncCard(this.cardInstance.cardInstanceWorkflow.id)
            .pipe(
              take(1),
              finalize(() => (this.synchronizingData = false))
            )
            .subscribe(
              (data) => {
                this.prepareAndMoveService.reloadData$.next('UPDATE_INFORMATION');
              },
              (error) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            );
        }
      });
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
  // TEMPLATE	      9	            Tab de pagos
  // TEMPLATE	      10	          Tab de contabilidad
  public showColumn(
    column:
      | 'CUSTOMIZABLE_ENTITY'
      | 'CUSTOMIZABLE_CUSTOM'
      | 'TEMPLATE_BUDGETS'
      | 'TEMPLATE_ATTACHMENTS'
      | 'PREFIXED_INFORMATION'
      | 'PREFIXED_HISTORY'
      | 'PREFIXED_TASKS'
      | 'TEMPLATE_PAYMENTS'
      | 'TEMPLATE_ACCOUNTING'
      | 'COMMENTS'
      | 'CLIENT_MESSAGES'
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
    } else if (column === 'TEMPLATE_PAYMENTS' && this.tabToShow.type === 'TEMPLATE' && this.tabToShow.contentTypeId === 9) {
      show = true;
    } else if (column === 'TEMPLATE_ACCOUNTING' && this.tabToShow.type === 'TEMPLATE' && this.tabToShow.contentTypeId === 10) {
      show = true;
    } else if (column === 'COMMENTS' && this.tabToShow.type === 'COMMENTS') {
      show = true;
    } else if (column === 'CLIENT_MESSAGES' && this.tabToShow.type === 'CLIENT_MESSAGES') {
      show = true;
    }
    return show;
  }
}
