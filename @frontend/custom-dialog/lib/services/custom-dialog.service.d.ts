import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { CustomDialogConfigI } from '../interfaces/custom-dialog-config';
import * as i0 from "@angular/core";
export declare class CustomDialogService {
    private dialog;
    closeResult$: Subject<{
        id: string;
        result: any;
    }>;
    constructor(dialog: MatDialog);
    /**
     * @functio open a custom dialog
     *
     * @param config: CustomDialogConfigI
     *
     * @returns an `Observable<any>` which will be resolved
     */
    open(config: CustomDialogConfigI): Observable<any>;
    /**
     * @function close
     * @param id of the dialog to close
     */
    close(id: string, result?: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CustomDialogService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CustomDialogService>;
}
