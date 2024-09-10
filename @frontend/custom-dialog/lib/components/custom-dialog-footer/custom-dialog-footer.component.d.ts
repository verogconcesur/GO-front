import { OnInit, EventEmitter } from '@angular/core';
import { CustomDialogFooterConfig } from '../../models/custom-dialog-footer-config';
import { CustomDialogButtonConfig } from '../../models/custom-dialog-button-config';
import * as i0 from "@angular/core";
export declare class CustomDialogFooterComponent implements OnInit {
    config: CustomDialogFooterConfig;
    close: EventEmitter<boolean>;
    submit: EventEmitter<boolean>;
    constructor();
    ngOnInit(): void;
    buttonClick: (button: CustomDialogButtonConfig) => void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CustomDialogFooterComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CustomDialogFooterComponent, "app-custom-dialog-footer", never, { "config": "config"; }, { "close": "close"; "submit": "submit"; }, never, never, false>;
}
