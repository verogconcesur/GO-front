import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { take } from 'rxjs/operators';
import { ModalAssociatedCardsComponent } from './modal-associated-cards.component';

@Injectable({
  providedIn: 'root'
})
export class ModalAssociatedCardsService implements OnDestroy {
  constructor(private dialog: MatDialog) {}

  ngOnDestroy(): void {}

  public openAssociatedCardsModal(id: number, type: 'customerId' | 'vehicleId' | 'calendar', cards?: WorkflowCardDTO[]): void {
    const width = '400px';
    const height = 'auto';
    this.dialog
      .open(ModalAssociatedCardsComponent, {
        width,
        height,
        maxHeight: '85vh',
        minHeight: '400px',
        panelClass: 'associated-cards-wrapper',
        disableClose: false,
        data: {
          id,
          type,
          cards
        }
      })
      .afterClosed()
      .pipe(take(1));
  }
}
