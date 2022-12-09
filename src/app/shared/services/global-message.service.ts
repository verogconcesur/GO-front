import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import {
  GLOBAL_MESSAGE_DEFAULT_DURATION,
  GLOBAL_MESSAGE_DEFAULT_HORIZONTAL_POSITION,
  GLOBAL_MESSAGE_DEFAULT_VERTICAL_POSITION,
  GLOBAL_MESSAGE_ERROR_CLASS,
  GLOBAL_MESSAGE_SUCCESS_CLASS,
  GLOBAL_MESSAGE_WARNING_CLASS
} from '@shared/constants/global-message';

export type GlobalMessageConfig = {
  /** Message text */
  message: string;

  /** Action text (ex: "Close") */
  actionText: string;

  /**
   * Duration while the message will be visible.
   * <br>Defaults to: `GLOBAL_MESSAGE_DEFAULT_DURATION`
   */
  duration?: number;

  /**
   * Horizontal position of the message.
   * <br>Valid values: `top` | `bottom`
   * <br>Defaults to: `GLOBAL_MESSAGE_DEFAULT_HORIZONTAL_POSITION`
   */
  horizontalPosition?: string;

  /**
   * Vertical position of the message.
   * <br>Valid values: `start` | `center` | `end` | `left` | `right`
   * <br>Defaults to: `GLOBAL_MESSAGE_DEFAULT_VERTICAL_POSITION`
   */
  verticalPosition?: string;
};

@Injectable()
export class GlobalMessageService {
  constructor(private snackBar: MatSnackBar, private translateService: TranslateService) {}

  /**
   * Shows a message with "error" styles
   *
   * @param config message configuration options
   */
  public showError(config: GlobalMessageConfig): void {
    this.showMessage(GLOBAL_MESSAGE_ERROR_CLASS, config);
  }

  /**
   * Shows a message with "success" styles
   *
   * @param config message configuration options
   */
  public showSuccess(config: GlobalMessageConfig): void {
    this.showMessage(GLOBAL_MESSAGE_SUCCESS_CLASS, config);
  }

  /**
   * Shows a message with "warning" styles
   *
   * @param config message configuration options
   */
  public showWarning(config: GlobalMessageConfig): void {
    this.showMessage(GLOBAL_MESSAGE_WARNING_CLASS, config);
  }

  private showMessage(className: string, config: GlobalMessageConfig): void {
    if (!config.message && className !== GLOBAL_MESSAGE_ERROR_CLASS) {
      return;
    } else if (!config.message && className === GLOBAL_MESSAGE_ERROR_CLASS) {
      config.message = this.translateService.instant('errors.unknown');
    }
    const duration = config.duration || GLOBAL_MESSAGE_DEFAULT_DURATION;
    const horizontalPosition = config.horizontalPosition || GLOBAL_MESSAGE_DEFAULT_HORIZONTAL_POSITION;
    const verticalPosition = config.verticalPosition || GLOBAL_MESSAGE_DEFAULT_VERTICAL_POSITION;

    this.snackBar.open(config.message, config.actionText, {
      duration,
      panelClass: className,
      horizontalPosition: horizontalPosition as MatSnackBarHorizontalPosition,
      verticalPosition: verticalPosition as MatSnackBarVerticalPosition
    });
  }
}
