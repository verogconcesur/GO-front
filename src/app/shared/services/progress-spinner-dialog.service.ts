import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProgressSpinnerDialogComponent } from '@shared/components/progress-spinner-dialog/progress-spinner-dialog.component';

@Injectable()
export class ProgressSpinnerDialogService {
  private instances: {
    [key: string]: MatDialogRef<ProgressSpinnerDialogComponent>;
  } = {};

  constructor(private dialog: MatDialog) {}

  /**
   * Open a progress spinner dialog
   *
   * @returns dialog identifier, to use with `close(dialogRefId)`
   */
  public show(): string {
    const dialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });

    this.instances[dialogRef.id] = dialogRef;

    return dialogRef.id;
  }

  /**
   * Close given progress spinner dialog
   *
   * @param dialogRefId dialog identifier, obtained when calling `show()`
   */
  public hide(dialogRefId: string) {
    const ref = this.instances[dialogRefId];

    if (ref) {
      ref.close();
      delete this.instances[dialogRefId];
    }
  }
}
