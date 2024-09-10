import { OnInit, EventEmitter } from '@angular/core';
import { CustomDialogButtonConfig } from '../../models/custom-dialog-button-config';
import * as i0 from "@angular/core";
export declare class CustomDialogButtonsWrapperComponent implements OnInit {
    buttons: CustomDialogButtonConfig[];
    buttonClick: EventEmitter<CustomDialogButtonConfig>;
    constructor();
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CustomDialogButtonsWrapperComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CustomDialogButtonsWrapperComponent, "app-custom-dialog-buttons-wrapper", never, { "buttons": "buttons"; }, { "buttonClick": "buttonClick"; }, never, never, false>;
}
