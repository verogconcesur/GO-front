import { Observable } from 'rxjs';
import { CustomDialogFooterConfigI } from '../interfaces/custom-dialog-footer-config';

export abstract class ComponentForCustomDialog {
  //If component is created throgh CustomDialgoService modalModeActive is set to true
  private modalModeActive = false;

  constructor(public MODAL_ID: string, public MODAL_PANEL_CLASS: string, public MODAL_TITLE?: string) {}

  public setModalModeActive(active: boolean): void {
    this.modalModeActive = active;
  }

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
   * @returns Observable<boolean>: if everything is ok send true to close modal
   */
  public abstract onSubmitCustomDialog(): Observable<boolean>;

  /**
   * setAndGetFooterConfig
   *
   * If there's no footer on the modal override the function sending: null
   *
   * @returns  CustomDialogFooterConfigI | null
   */
  public abstract setAndGetFooterConfig(): CustomDialogFooterConfigI | null;
}
