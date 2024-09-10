import { Observable } from 'rxjs';
import { CustomDialogFooterConfigI } from '../interfaces/custom-dialog-footer-config';
/**
 * @abstract @class ComponentToExtendForCustomDialog
 * @override confirmCloseCustomDialog function
 * @override onSubmitCustomDialog function
 * @override setAndGetFooterConfig function
 */
export declare abstract class ComponentToExtendForCustomDialog {
    MODAL_ID: string;
    MODAL_PANEL_CLASS: string;
    MODAL_TITLE?: string | undefined;
    extendedComponentData: any;
    private modalModeActive;
    /**
     * @constructor ComponentToExtendForCustomDialog
     * @param MODAL_ID id used to reference the dialog modal
     * @param MODAL_PANEL_CLASS class used in the dialog modal
     * @param MODAL_TITLE? title for the modal
     */
    constructor(MODAL_ID: string, MODAL_PANEL_CLASS: string, MODAL_TITLE?: string | undefined);
    setModalModeActive(active: boolean): void;
    /**
     * isModalModeActive
     *
     * @returns boolean if modal mode is active
     */
    isModalModeActive(): boolean;
    /**
     * confirmCloseCustomDialog
     *
     * If there's nothing to check override the function sending: of(true)
     *
     * @returns Observable<boolean>: if everything is ok send true to close modal
     */
    abstract confirmCloseCustomDialog(): Observable<boolean>;
    /**
     * onSubmitCustomDialog
     *
     * If there's nothing to check override the function sending: of(true)
     *
     * @returns Observable<any>: if everything is ok send true or any data !== null, undefined, 0 or '' to close modal
     */
    abstract onSubmitCustomDialog(): Observable<any>;
    /**
     * setAndGetFooterConfig
     *
     * If there's no footer on the modal override the function sending: null
     *
     * @returns  CustomDialogFooterConfigI | null
     */
    abstract setAndGetFooterConfig(): CustomDialogFooterConfigI | null;
}
