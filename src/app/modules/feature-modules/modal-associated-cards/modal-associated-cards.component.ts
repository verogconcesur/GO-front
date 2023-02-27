import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    reset: marker('common.reset'),
    noData: marker('errors.noDataToShow')
  };
  public cards: WorkflowCardDTO[] = [];

  constructor(
    private dialogRef: MatDialogRef<ModalAssociatedCardsComponent>,
    private translateService: TranslateService,
    private workflowService: WorkflowsService,
    private spinnerService: ProgressSpinnerDialogService,
    @Inject(MAT_DIALOG_DATA) public dialogData: { id: number; type: 'customerId' | 'vehicleId' }
  ) {}

  ngOnInit(): void {
    if (this.dialogData) {
      const spinner = this.spinnerService.show();
      this.workflowService
        .searchCardsInWorkflowsByCustomerOrVehicleId(this.dialogData.id, this.dialogData.type)
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe((data: WorkflowCardDTO[]) => (this.cards = data));
    }
  }

  public getTitle(): string {
    if (this.dialogData.type === 'customerId') {
      return this.translateService.instant(this.labels.cardsByCustomer);
    }
    return this.translateService.instant(this.labels.cardsByVehicle);
  }

  public close(): void {
    this.dialogRef.close();
  }
}
