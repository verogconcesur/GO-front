import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';

export type ConfirmDialogConfig = {
  /** Dialog title */
  title: string;

  /** Dialog descriptive message */
  message: string;

  /**
   * Max-width of the dialog. If a number is provided,
   * <br>assumes pixel units. Defaults to 80vw.
   */
  maxWidth?: string | number;

  /** Text for the positive ("yes") action button */
  yesActionText?: string;

  /** Text for the negative ("no") action button */
  noActionText?: string;
};

@Injectable()
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Open a confirm dialog
   *
   * @param config dialog configuration options
   *
   * @returns an `Observable<boolean>` which will be resolved
   * <br>with `true` if the user selects the positive action,
   * <br>or a _falsy_  value if any other.
   */
  public open(config: ConfirmDialogConfig): Observable<boolean> {
    const { maxWidth, title, message, yesActionText, noActionText } = config;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth,
      data: {
        title,
        message,
        yesActionText,
        noActionText
      }
    });

    return dialogRef.afterClosed();
  }
}
