import { ComponentType } from '@angular/cdk/portal';
import { ComponentForCustomDialog } from '../models/component-for-custom-dialog';

export interface CustomDialogConfigI {
  component: ComponentType<ComponentForCustomDialog>;
  id: string;
  panelClass: string;
  maxWidth?: number | string;
  minWidth?: number | string;
  width?: string;
  disableClose?: boolean;
}
