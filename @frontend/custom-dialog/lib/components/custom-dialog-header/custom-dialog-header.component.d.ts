import { EventEmitter } from '@angular/core';
import { CustomDialogHeaderConfigI } from '../../interfaces/custom-dialog-header-config';
import * as i0 from "@angular/core";
export declare class CustomDialogHeaderComponent {
    config: CustomDialogHeaderConfigI;
    close: EventEmitter<boolean>;
    constructor();
    getTitleLabel(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<CustomDialogHeaderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CustomDialogHeaderComponent, "app-custom-dialog-header", never, { "config": "config"; }, { "close": "close"; }, never, never, false>;
}
