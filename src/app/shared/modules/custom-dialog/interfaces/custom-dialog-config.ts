import { ComponentType } from '@angular/cdk/portal';
import { ComponentToExtendForCustomDialog } from '../models/component-for-custom-dialog';

/**
 * @interface CustomDialogConfigI
 * - component {ComponentType<ComponentToExtendForCustomDialog>} must extend ComponentToExtendForCustomDialog abstract class
 * - id {string} used to reference the id of the dialog
 * - panelClass {string} used like a class for the dialog
 * - maxWidth? {number | string} for the dialog
 * - minWidth? {number | string} for the dialog
 * - width? {string} for the dialog
 * - disableClose? {boolean}  avoid to close the modal clicking on the background
 */
export interface CustomDialogConfigI {
  id: string;
  panelClass: string;
  component: ComponentType<ComponentToExtendForCustomDialog>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extendedComponentData?: any;
  maxWidth?: number | string;
  minWidth?: number | string;
  width?: string;
  disableClose?: boolean;
}
