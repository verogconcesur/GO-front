import { CustomDialogButtonConfig } from './custom-dialog-button-config';
import { CustomDialogFooterConfigI } from '../interfaces/custom-dialog-footer-config';
/**
 * @class CustomDialogFooterConfig
 * @implements CustomDialogFooterConfigI
 */
export declare class CustomDialogFooterConfig implements CustomDialogFooterConfigI {
    show: boolean;
    leftSideButtons: CustomDialogButtonConfig[];
    rightSideButtons: CustomDialogButtonConfig[];
    /**
     * @constructs CustomDialogFooterConfig
     * @param config: CustomDialogFooterConfigI
     */
    constructor(config: CustomDialogFooterConfigI | null);
}
