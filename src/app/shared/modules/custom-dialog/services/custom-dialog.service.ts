import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CustomDialogComponent } from '../custom-dialog.component';
import { CustomDialogConfigI } from '../interfaces/custom-dialog-config';

@Injectable()
export class CustomDialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Open a custom dialog
   *
   * @param config custom configuration options
   *
   * @returns an `Observable<any>` which will be resolved
   */
  /*eslint @typescript-eslint/no-explicit-any: ["error", { "ignoreRestArgs": false }]*/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public open(config: CustomDialogConfigI): Observable<any> {
    const { maxWidth, disableClose, component } = config;
    const dialogRef = this.dialog.open(CustomDialogComponent, {
        maxWidth,
        disableClose,
        data: {
          component
        }
    });

    return dialogRef.afterClosed();
  }
}
