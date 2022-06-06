import { Observable } from 'rxjs';
import { CustomDialogButtonConfigI } from '../interfaces/custom-dialog-button-config';

/**
 * @class CustomDialogButtonConfig
 * @implements CustomDialogButtonConfigI
 */
export class CustomDialogButtonConfig implements CustomDialogButtonConfigI {
  public type: 'close' | 'submit' | 'custom';
  public design: '' | 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab';
  public color: '' | 'primary' | 'warn' | 'accent';
  public class: string;
  public label: string;
  public iconName: string;
  public iconFontSet: 'concenet' | string;
  public iconPosition: 'start' | 'end';
  public disabledFn: () => boolean;
  public hiddenFn: () => boolean;
  public clickFn: () => void;
  private errorMessage = 'Error creating button:';

  /**
   * @constructor CustomDialogButtonConfig
   * @param config: CustomDialogButtonConfigI
   */
  constructor(config: CustomDialogButtonConfigI) {
    this.type = config.type;
    this.design = config.design ? config.design : '';
    this.color = config.color ? config.color : '';
    this.class = config.class ? config.class : '';
    this.label = config.label ? config.label : '';
    this.iconName = config.iconName ? config.iconName : '';
    this.iconFontSet = config.iconFontSet ? config.iconFontSet : '';
    this.iconPosition = config.iconPosition ? config.iconPosition : 'end';
    this.disabledFn = config.disabledFn ? config.disabledFn : () => false;
    this.hiddenFn = config.hiddenFn ? config.hiddenFn : () => false;
    this.clickFn = config.clickFn ? config.clickFn : null;
    //Check if button definition is ok
    if (!this.label && !this.iconName) {
      throw new Error(`${this.errorMessage} Label or IconName necessary`);
    } else if (this.type === 'custom' && !this.clickFn) {
      throw new Error(`${this.errorMessage} Button type 'custom' requires to define a 'clickFn' function`);
    } else if (!this.iconName && this.iconFontSet) {
      throw new Error(`${this.errorMessage} Icon fontset defined but not 'iconName' found`);
    } else if (this.disabledFn && this.disabledFn.toString().indexOf('=>') === -1) {
      throw new Error(`${this.errorMessage} disabledFn must be an arrow function`);
    } else if (this.hiddenFn && this.hiddenFn.toString().indexOf('=>') === -1) {
      throw new Error(`${this.errorMessage} hiddenFn must be an arrow function`);
    } else if (this.clickFn && this.clickFn.toString().indexOf('=>') === -1) {
      throw new Error(`${this.errorMessage} clickFn must be an arrow function`);
    }
  }

  //Return the class to use in the button
  public getClass() {
    switch (this.design) {
      case 'raised':
        return `${this.class} mat-raised-button`;
        break;
      case 'stroked':
        return `${this.class} mat-stroked-button`;
        break;
      case 'flat':
        return `${this.class} mat-flat-button`;
        break;
      case 'icon':
        return `${this.class} mat-icon-button`;
        break;
      case 'fab':
        return `${this.class} mat-fab`;
        break;
      case 'mini-fab':
        return `${this.class} mat-mini-fab`;
        break;
      default:
        return this.class;
    }
  }
}
