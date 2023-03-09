import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { ModalAssociatedCardsComponent } from './modal-associated-cards.component';

@Injectable({
  providedIn: 'root'
})
export class ModalAssociatedCardsService implements OnDestroy {
  constructor(private dialog: MatDialog) {}

  ngOnDestroy(): void {}

  public openAssociatedCardsModal(id: number, type: 'customerId' | 'vehicleId'): void {
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
          type
        }
      })
      .afterClosed()
      .pipe(take(1));
  }
}
