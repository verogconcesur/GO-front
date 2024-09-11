import { CustomDialogButtonConfigI } from '../interfaces/custom-dialog-button-config';
/**
 * @class CustomDialogButtonConfig
 * @implements CustomDialogButtonConfigI
 */
export declare class CustomDialogButtonConfig implements CustomDialogButtonConfigI {
    type: 'close' | 'submit' | 'custom';
    design: '' | 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab';
    color: '' | 'primary' | 'warn' | 'accent';
    class: string;
    label: string;
    iconName: string;
    iconFontSet: 'concenet' | string;
    iconPosition: 'start' | 'end';
    disabledFn: () => boolean;
    hiddenFn: () => boolean;
    clickFn: () => void;
    private errorMessage;
    /**
     * @constructor CustomDialogButtonConfig
     * @param config: CustomDialogButtonConfigI
     */
    constructor(config: CustomDialogButtonConfigI);
    getClass(): string;
}
