import { Observable } from 'rxjs';
import { CustomDialogFooterConfigI } from '../interfaces/custom-dialog-footer-config';

/**
 * @abstract @class ComponentToExtendForCustomDialog
 * @override confirmCloseCustomDialog function
 * @override onSubmitCustomDialog function
 * @override setAndGetFooterConfig function
 */
export abstract class ComponentToExtendForCustomDialog {
  //Data passed from customDialogService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public extendedComponentData: any = null;
  //If component is created throgh CustomDialgoService modalModeActive is set to true
  private modalModeActive = false;

  /**
   * @constructor ComponentToExtendForCustomDialog
   * @param MODAL_ID id used to reference the dialog modal
   * @param MODAL_PANEL_CLASS class used in the dialog modal
   * @param MODAL_TITLE? title for the modal
   */
  constructor(public MODAL_ID: string, public MODAL_PANEL_CLASS: string, public MODAL_TITLE?: string) {}

  //If component is created throgh CustomDialgoService this function is called
  public setModalModeActive(active: boolean): void {
    this.modalModeActive = active;
  }

  /**
   * isModalModeActive
   *
   * @returns boolean if modal mode is active
   */
  public isModalModeActive(): boolean {
    return this.modalModeActive;
  }

  /**
   * confirmCloseCustomDialog
   *
   * If there's nothing to check override the function sending: of(true)
   *
   * @returns Observable<boolean>: if everything is ok send true to close modal
   */
  public abstract confirmCloseCustomDialog(): Observable<boolean>;

  /**
   * onSubmitCustomDialog
   *
   * If there's nothing to check override the function sending: of(true)
   *
   * @returns Observable<any>: if everything is ok send true or any data !== null, undefined, 0 or '' to close modal
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public abstract onSubmitCustomDialog(): Observable<any>;

  /**
   * setAndGetFooterConfig
   *
   * If there's no footer on the modal override the function sending: null
   *
   * @returns  CustomDialogFooterConfigI | null
   */
  public abstract setAndGetFooterConfig(): CustomDialogFooterConfigI | null;
}
