import { ComponentType } from '@angular/cdk/portal';
import { ComponentForCustomDialog } from '../models/component-for-custom-dialog';

export interface CustomDialogConfigI {
    component: ComponentType<ComponentForCustomDialog>;
    maxWidth?: number | string;
    disableClose?: boolean;
}
