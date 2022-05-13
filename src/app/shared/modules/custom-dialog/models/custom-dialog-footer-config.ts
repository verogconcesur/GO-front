import { CustomDialogButtonConfig } from './custom-dialog-button-config';
import { CustomDialogFooterConfigI } from '../interfaces/custom-dialog-footer-config';

/**
 * @class CustomDialogFooterConfig
 * @implements CustomDialogFooterConfigI
 */
export class CustomDialogFooterConfig implements CustomDialogFooterConfigI {
  public show = false;
  public leftSideButtons: CustomDialogButtonConfig[] = [];
  public rightSideButtons: CustomDialogButtonConfig[] = [];

  /**
   * @constructs CustomDialogFooterConfig
   * @param config: CustomDialogFooterConfigI
   */
  constructor(config: CustomDialogFooterConfigI) {
    try {
      if (config && config.show) {
        this.show = true;
        if (config.leftSideButtons && config.leftSideButtons.length) {
          this.leftSideButtons = config.leftSideButtons.map(objI => new CustomDialogButtonConfig(objI));
        }
        if (config.rightSideButtons && config.rightSideButtons.length) {
          this.rightSideButtons = config.rightSideButtons.map(objI => new CustomDialogButtonConfig(objI));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
