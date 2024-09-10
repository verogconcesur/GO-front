import { AfterViewInit, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ComponentToExtendForCustomDialog } from './models/component-for-custom-dialog';
import { CustomDialogConfigI } from './interfaces/custom-dialog-config';
import { CustomDialogHeaderConfigI } from './interfaces/custom-dialog-header-config';
import { CustomDialogFooterConfig } from './models/custom-dialog-footer-config';
import { CustomDialogService } from './services/custom-dialog.service';
import * as i0 from "@angular/core";
export declare class CustomDialogComponent implements OnInit, AfterViewInit, OnDestroy {
    dialogRef: MatDialogRef<ComponentToExtendForCustomDialog>;
    private customDialogService;
    config: CustomDialogConfigI;
    dynamicViewContainer: ViewContainerRef;
    headerConfig: CustomDialogHeaderConfigI;
    footerConfig: CustomDialogFooterConfig;
    private componentRef;
    constructor(dialogRef: MatDialogRef<ComponentToExtendForCustomDialog>, customDialogService: CustomDialogService, config: CustomDialogConfigI);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    closeAction(): void;
    submitAction(): void;
    changeTitle(): void;
    private loadInnerModalComponent;
    private getComponentConfiguration;
    private close;
    static ɵfac: i0.ɵɵFactoryDeclaration<CustomDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CustomDialogComponent, "app-custom-dialog", never, {}, {}, never, never, false>;
}
