import { CustomDialogButtonConfigI } from './custom-dialog.button';

/**
 * CustomDialogFooterConfigI
 * show: boolean;
 * leftSideButtons?: CustomDialogButtonConfigI[];
 * rightSideButtons?: CustomDialogButtonConfigI[];
 */
export interface CustomDialogFooterConfigI {
  show: boolean;
  leftSideButtons?: CustomDialogButtonConfigI[];
  rightSideButtons?: CustomDialogButtonConfigI[];
}
