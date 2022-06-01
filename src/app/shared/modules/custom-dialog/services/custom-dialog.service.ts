import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CustomDialogComponent } from '../custom-dialog.component';
import { CustomDialogConfigI } from '../interfaces/custom-dialog-config';

@Injectable()
export class CustomDialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * @functio open a custom dialog
   *
   * @param config: CustomDialogConfigI
   *
   * @returns an `Observable<any>` which will be resolved
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public open(config: CustomDialogConfigI): Observable<any> {
    const {
      maxWidth,
      minWidth,
      width,
      maxHeight,
      minHeight,
      height,
      disableClose,
      component,
      id,
      panelClass,
      extendedComponentData
    } = config;
    const dialogRef = this.dialog.open(CustomDialogComponent, {
      id,
      panelClass,
      maxWidth,
      minWidth,
      width,
      maxHeight,
      minHeight,
      height,
      disableClose,
      data: {
        component,
        extendedComponentData
      }
    });

    return dialogRef.afterClosed();
  }

  /**
   * @function close
   * @param id of the dialog to close
   */
  public close(id: string): void {
    this.dialog.getDialogById(id).close();
  }
}
