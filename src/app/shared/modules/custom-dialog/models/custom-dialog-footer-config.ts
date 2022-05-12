import { CustomDialogButtonConfig } from './custom-dialog-button-config';
import { CustomDialogFooterConfigI } from '../interfaces/custom-dialog-footer-config';
import { throwError } from 'rxjs';

export class CustomDialogFooterConfig {
  public show = false;
  public leftSideButtonsWrapper: CustomDialogButtonConfig[] = [];
  public rightSideButtonsWrapper: CustomDialogButtonConfig[] = [];

  constructor(config: CustomDialogFooterConfigI) {
    try {
      if (config && config.show) {
        this.show = true;
        if (config.leftSideButtons && config.leftSideButtons.length) {
          this.leftSideButtonsWrapper = config.leftSideButtons.map(objI => new CustomDialogButtonConfig(objI));
        }
        if (config.rightSideButtons && config.rightSideButtons.length) {
          this.rightSideButtonsWrapper = config.rightSideButtons.map(objI => new CustomDialogButtonConfig(objI));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
