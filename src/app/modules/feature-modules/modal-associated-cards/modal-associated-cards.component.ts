import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { TranslateService } from '@ngx-translate/core';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-modal-associated-cards',
  templateUrl: './modal-associated-cards.component.html',
  styleUrls: ['./modal-associated-cards.component.scss']
})
export class ModalAssociatedCardsComponent implements OnInit {
  public labels = {
    cardsByCustomer: marker('workflows.card.customerAssociatedCards'),
    cardsByVehicle: marker('workflows.card.vehicleAssociatedCards'),
    cardsByCalendar: marker('workflows.card.cardsByCalendar'),
    reset: marker('common.reset'),
    noData: marker('errors.noDataToShow')
  };
  public cards: WorkflowCardDTO[] = [];
  public cardsByGroup: { workflowId: number; workflowName: string; cards: WorkflowCardDTO[] }[] = [];

  constructor(
    private dialogRef: MatDialogRef<ModalAssociatedCardsComponent>,
    private translateService: TranslateService,
    private workflowService: WorkflowsService,
    private spinnerService: ProgressSpinnerDialogService,
    @Inject(MAT_DIALOG_DATA)
    public dialogData: { id: number; type: 'customerId' | 'vehicleId' | 'calendar'; cards?: WorkflowCardDTO[] }
  ) {}

  ngOnInit(): void {
    if (this.dialogData && this.dialogData.type !== 'calendar') {
      const spinner = this.spinnerService.show();
      this.workflowService
        .searchCardsInWorkflowsByCustomerOrVehicleId(this.dialogData.id, this.dialogData.type)
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe((data: WorkflowCardDTO[]) => {
          this.cards = data;
          this.cardsByGroup = [];
          if (this.cards?.length) {
            if (data) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const dataByWorkflow: any = {};
              data.forEach((card: WorkflowCardDTO) => {
                if (dataByWorkflow[card.cardInstanceWorkflows[0].workflowId]) {
                  dataByWorkflow[card.cardInstanceWorkflows[0].workflowId].cards = [
                    ...dataByWorkflow[card.cardInstanceWorkflows[0].workflowId].cards,
                    card
                  ];
                } else {
                  dataByWorkflow[card.cardInstanceWorkflows[0].workflowId] = {
                    workflowName: card.cardInstanceWorkflows[0].workflowName,
                    workflowId: card.cardInstanceWorkflows[0].workflowId,
                    cards: [card]
                  };
                }
              });
              const result = Object.keys(dataByWorkflow).map((k) => dataByWorkflow[k]);
              this.cardsByGroup = result;
            }
          }
        });
    } else {
      if (this.dialogData.cards.length) {
        this.cards = this.dialogData.cards;
        this.cardsByGroup = [];
        if (this.dialogData.cards) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dataByWorkflow: any = {};
          this.dialogData.cards.forEach((card: WorkflowCardDTO) => {
            if (dataByWorkflow[card.cardInstanceWorkflows[0].workflowId]) {
              dataByWorkflow[card.cardInstanceWorkflows[0].workflowId].cards = [
                ...dataByWorkflow[card.cardInstanceWorkflows[0].workflowId].cards,
                card
              ];
            } else {
              dataByWorkflow[card.cardInstanceWorkflows[0].workflowId] = {
                workflowName: card.cardInstanceWorkflows[0].workflowName,
                workflowId: card.cardInstanceWorkflows[0].workflowId,
                cards: [card]
              };
            }
          });
          const result = Object.keys(dataByWorkflow).map((k) => dataByWorkflow[k]);
          this.cardsByGroup = result;
        }
      }
    }
  }

  public getTitle(): string {
    if (this.dialogData.type === 'customerId') {
      return this.translateService.instant(this.labels.cardsByCustomer);
    } else if (this.dialogData.type === 'vehicleId') {
      return this.translateService.instant(this.labels.cardsByVehicle);
    }
    return this.translateService.instant(this.labels.cardsByCalendar);
  }

  public close(): void {
    this.dialogRef.close();
  }
}
