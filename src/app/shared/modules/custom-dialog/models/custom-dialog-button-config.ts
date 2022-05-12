import { CustomDialogButtonConfigI } from '../interfaces/custom-dialog.button';
import { throwError } from 'rxjs';

export class CustomDialogButtonConfig {
  public type: 'close' | 'submit' | 'custom';
  public design: '' | 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab';
  public color: '' | 'primary' | 'warn' | 'accent';
  public class: string;
  public label: string;
  public iconName: string;
  public iconFontSet: 'concenet' | string;
  public iconsPosition: 'start' | 'end';
  public disabledFn: () => void;
  public hiddenFn: () => void;
  public clickFn: () => void;
  private errorMessage = 'Error creating button:';

  constructor(config: CustomDialogButtonConfigI) {
    this.type = config.type;
    this.design = config.design ? config.design : '';
    this.color = config.color ? config.color : '';
    this.class = config.class ? config.class : '';
    this.label = config.label ? config.label : '';
    this.iconName = config.iconName ? config.iconName : '';
    this.iconFontSet = config.iconFontSet ? config.iconFontSet : '';
    this.iconsPosition = config.iconsPosition ? config.iconsPosition : 'end';
    this.disabledFn = config.disabledFn ? config.disabledFn : null;
    this.hiddenFn = config.hiddenFn ? config.hiddenFn : null;
    this.clickFn = config.clickFn ? config.clickFn : null;
    //Check if everything is ok
    if (!this.label && !this.iconName) {
      throwError(`${this.errorMessage} Label or IconName necessary`);
    }
  }
}
