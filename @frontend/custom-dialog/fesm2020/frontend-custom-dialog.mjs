import * as i0 from '@angular/core';
import { EventEmitter, Component, Input, Output, ViewContainerRef, Inject, ViewChild, Injectable, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { __decorate } from 'tslib';
import * as i1$2 from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import * as i3$1 from '@angular/material/divider';
import { MatDividerModule } from '@angular/material/divider';
import * as i1 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import * as i2 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import * as i3 from '@angular/flex-layout/flex';
import * as i4 from '@ngx-translate/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import * as i1$1 from '@angular/common';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * @class CustomDialogButtonConfig
 * @implements CustomDialogButtonConfigI
 */
class CustomDialogButtonConfig {
    /**
     * @constructor CustomDialogButtonConfig
     * @param config: CustomDialogButtonConfigI
     */
    constructor(config) {
        this.errorMessage = 'Error creating button:';
        this.type = config.type;
        this.design = config.design ? config.design : '';
        this.color = config.color ? config.color : '';
        this.class = config.class ? config.class : '';
        this.label = config.label ? config.label : '';
        this.iconName = config.iconName ? config.iconName : '';
        this.iconFontSet = config.iconFontSet ? config.iconFontSet : '';
        this.iconPosition = config.iconPosition ? config.iconPosition : 'end';
        this.disabledFn = config.disabledFn ? config.disabledFn : () => false;
        this.hiddenFn = config.hiddenFn ? config.hiddenFn : () => false;
        this.clickFn = config.clickFn ? config.clickFn : () => false;
        //Check if button definition is ok
        if (!this.label && !this.iconName) {
            throw new Error(`${this.errorMessage} Label or IconName necessary`);
        }
        else if (this.type === 'custom' && !this.clickFn) {
            throw new Error(`${this.errorMessage} Button type 'custom' requires to define a 'clickFn' function`);
        }
        else if (!this.iconName && this.iconFontSet) {
            throw new Error(`${this.errorMessage} Icon fontset defined but not 'iconName' found`);
        }
        else if (this.disabledFn &&
            this.disabledFn.toString().indexOf('=>') === -1) {
            throw new Error(`${this.errorMessage} disabledFn must be an arrow function`);
        }
        else if (this.hiddenFn && this.hiddenFn.toString().indexOf('=>') === -1) {
            throw new Error(`${this.errorMessage} hiddenFn must be an arrow function`);
        }
        else if (this.clickFn && this.clickFn.toString().indexOf('=>') === -1) {
            throw new Error(`${this.errorMessage} clickFn must be an arrow function`);
        }
    }
    //Return the class to use in the button
    getClass() {
        switch (this.design) {
            case 'raised':
                return `${this.class} mat-raised-button`;
                break;
            case 'stroked':
                return `${this.class} mat-stroked-button`;
                break;
            case 'flat':
                return `${this.class} mat-flat-button`;
                break;
            case 'icon':
                return `${this.class} mat-icon-button`;
                break;
            case 'fab':
                return `${this.class} mat-fab`;
                break;
            case 'mini-fab':
                return `${this.class} mat-mini-fab`;
                break;
            default:
                return this.class;
        }
    }
}

/**
 * @class CustomDialogFooterConfig
 * @implements CustomDialogFooterConfigI
 */
class CustomDialogFooterConfig {
    /**
     * @constructs CustomDialogFooterConfig
     * @param config: CustomDialogFooterConfigI
     */
    constructor(config) {
        this.show = false;
        this.leftSideButtons = [];
        this.rightSideButtons = [];
        try {
            if (config && config.show) {
                this.show = true;
                if (config.leftSideButtons && config.leftSideButtons.length) {
                    this.leftSideButtons = config.leftSideButtons.map((objI) => new CustomDialogButtonConfig(objI));
                }
                if (config.rightSideButtons && config.rightSideButtons.length) {
                    this.rightSideButtons = config.rightSideButtons.map((objI) => new CustomDialogButtonConfig(objI));
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}

class CustomDialogHeaderComponent {
    constructor() {
        this.close = new EventEmitter();
    }
    getTitleLabel() {
        return this.config?.titleLabel ? this.config.titleLabel : '';
    }
}
CustomDialogHeaderComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogHeaderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
CustomDialogHeaderComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.3", type: CustomDialogHeaderComponent, selector: "app-custom-dialog-header", inputs: { config: "config" }, outputs: { close: "close" }, ngImport: i0, template: "<div\r\n  class=\"custom-dialog__header\"\r\n  fxLayout=\"row\"\r\n  fxLayoutAlign=\"space-between center\"\r\n>\r\n  <div class=\"custom-dialog__header__title mat-title\">\r\n    {{ getTitleLabel() | translate }}\r\n  </div>\r\n  <div class=\"custom-dialog__header__close-button\">\r\n    <button\r\n      mat-icon-button\r\n      aria-label=\"close\"\r\n      class=\"close-modal-button\"\r\n      (click)=\"close.emit(true)\"\r\n      fxLayout=\"row\"\r\n      fxLayoutAlign=\"center center\"\r\n    >\r\n      <mat-icon>close</mat-icon>\r\n    </button>\r\n  </div>\r\n</div>\r\n", styles: [".custom-dialog__header__title{margin:0}\n"], dependencies: [{ kind: "component", type: i1.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: i3.DefaultLayoutDirective, selector: "  [fxLayout], [fxLayout.xs], [fxLayout.sm], [fxLayout.md],  [fxLayout.lg], [fxLayout.xl], [fxLayout.lt-sm], [fxLayout.lt-md],  [fxLayout.lt-lg], [fxLayout.lt-xl], [fxLayout.gt-xs], [fxLayout.gt-sm],  [fxLayout.gt-md], [fxLayout.gt-lg]", inputs: ["fxLayout", "fxLayout.xs", "fxLayout.sm", "fxLayout.md", "fxLayout.lg", "fxLayout.xl", "fxLayout.lt-sm", "fxLayout.lt-md", "fxLayout.lt-lg", "fxLayout.lt-xl", "fxLayout.gt-xs", "fxLayout.gt-sm", "fxLayout.gt-md", "fxLayout.gt-lg"] }, { kind: "directive", type: i3.DefaultLayoutAlignDirective, selector: "  [fxLayoutAlign], [fxLayoutAlign.xs], [fxLayoutAlign.sm], [fxLayoutAlign.md],  [fxLayoutAlign.lg], [fxLayoutAlign.xl], [fxLayoutAlign.lt-sm], [fxLayoutAlign.lt-md],  [fxLayoutAlign.lt-lg], [fxLayoutAlign.lt-xl], [fxLayoutAlign.gt-xs], [fxLayoutAlign.gt-sm],  [fxLayoutAlign.gt-md], [fxLayoutAlign.gt-lg]", inputs: ["fxLayoutAlign", "fxLayoutAlign.xs", "fxLayoutAlign.sm", "fxLayoutAlign.md", "fxLayoutAlign.lg", "fxLayoutAlign.xl", "fxLayoutAlign.lt-sm", "fxLayoutAlign.lt-md", "fxLayoutAlign.lt-lg", "fxLayoutAlign.lt-xl", "fxLayoutAlign.gt-xs", "fxLayoutAlign.gt-sm", "fxLayoutAlign.gt-md", "fxLayoutAlign.gt-lg"] }, { kind: "pipe", type: i4.TranslatePipe, name: "translate" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-custom-dialog-header', template: "<div\r\n  class=\"custom-dialog__header\"\r\n  fxLayout=\"row\"\r\n  fxLayoutAlign=\"space-between center\"\r\n>\r\n  <div class=\"custom-dialog__header__title mat-title\">\r\n    {{ getTitleLabel() | translate }}\r\n  </div>\r\n  <div class=\"custom-dialog__header__close-button\">\r\n    <button\r\n      mat-icon-button\r\n      aria-label=\"close\"\r\n      class=\"close-modal-button\"\r\n      (click)=\"close.emit(true)\"\r\n      fxLayout=\"row\"\r\n      fxLayoutAlign=\"center center\"\r\n    >\r\n      <mat-icon>close</mat-icon>\r\n    </button>\r\n  </div>\r\n</div>\r\n", styles: [".custom-dialog__header__title{margin:0}\n"] }]
        }], ctorParameters: function () { return []; }, propDecorators: { config: [{
                type: Input
            }], close: [{
                type: Output
            }] } });

class CustomDialogButtonsWrapperComponent {
    constructor() {
        this.buttonClick = new EventEmitter();
    }
    ngOnInit() { }
}
CustomDialogButtonsWrapperComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogButtonsWrapperComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
CustomDialogButtonsWrapperComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.3", type: CustomDialogButtonsWrapperComponent, selector: "app-custom-dialog-buttons-wrapper", inputs: { buttons: "buttons" }, outputs: { buttonClick: "buttonClick" }, ngImport: i0, template: "<button\r\n    mat-button\r\n    *ngFor=\"let button of buttons\"\r\n    [class]=\"'custom-dialog__button ' + button.getClass()\"\r\n    [color]=\"button.color\"\r\n    [disabled]=\"button.disabledFn()\"\r\n    [style.visibility]=\"button.hiddenFn() ? 'hidden' : 'visible'\"\r\n    (click)=\"buttonClick.emit(button)\"\r\n>\r\n    <mat-icon *ngIf=\"button.iconName && button.iconPosition === 'start'\" [fontSet]=\"button.iconFontSet\">{{\r\n        button.iconName\r\n    }}</mat-icon>\r\n    <span *ngIf=\"button.label\"> {{ button.label | translate }}</span>\r\n    <mat-icon *ngIf=\"button.iconName && button.iconPosition === 'end'\" [fontSet]=\"button.iconFontSet\">{{\r\n        button.iconName\r\n    }}</mat-icon>\r\n</button>\r\n", styles: ["button.custom-dialog__button{margin:0 5px 5px}button.custom-dialog__button:first-child{margin-left:0}button.custom-dialog__button:last-child{margin-right:0}\n"], dependencies: [{ kind: "directive", type: i1$1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1$1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i1.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "pipe", type: i4.TranslatePipe, name: "translate" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogButtonsWrapperComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-custom-dialog-buttons-wrapper', template: "<button\r\n    mat-button\r\n    *ngFor=\"let button of buttons\"\r\n    [class]=\"'custom-dialog__button ' + button.getClass()\"\r\n    [color]=\"button.color\"\r\n    [disabled]=\"button.disabledFn()\"\r\n    [style.visibility]=\"button.hiddenFn() ? 'hidden' : 'visible'\"\r\n    (click)=\"buttonClick.emit(button)\"\r\n>\r\n    <mat-icon *ngIf=\"button.iconName && button.iconPosition === 'start'\" [fontSet]=\"button.iconFontSet\">{{\r\n        button.iconName\r\n    }}</mat-icon>\r\n    <span *ngIf=\"button.label\"> {{ button.label | translate }}</span>\r\n    <mat-icon *ngIf=\"button.iconName && button.iconPosition === 'end'\" [fontSet]=\"button.iconFontSet\">{{\r\n        button.iconName\r\n    }}</mat-icon>\r\n</button>\r\n", styles: ["button.custom-dialog__button{margin:0 5px 5px}button.custom-dialog__button:first-child{margin-left:0}button.custom-dialog__button:last-child{margin-right:0}\n"] }]
        }], ctorParameters: function () { return []; }, propDecorators: { buttons: [{
                type: Input
            }], buttonClick: [{
                type: Output
            }] } });

class CustomDialogFooterComponent {
    constructor() {
        this.close = new EventEmitter();
        this.submit = new EventEmitter();
        this.buttonClick = (button) => {
            if (button.type === 'close') {
                this.close.emit(true);
            }
            else if (button.type === 'submit') {
                this.submit.emit(true);
            }
            else {
                button.clickFn();
            }
        };
    }
    ngOnInit() { }
}
CustomDialogFooterComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogFooterComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
CustomDialogFooterComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.3", type: CustomDialogFooterComponent, selector: "app-custom-dialog-footer", inputs: { config: "config" }, outputs: { close: "close", submit: "submit" }, ngImport: i0, template: "<div\r\n    class=\"custom-dialog__footer\"\r\n    fxLayout=\"row-reverse\"\r\n    fxLayout.xs=\"column\"\r\n    fxLayoutAlign=\"start start\"\r\n    fxLayoutAlign.gt-xs=\"space-between center\"\r\n    *ngIf=\"config?.show\"\r\n>\r\n    <app-custom-dialog-buttons-wrapper\r\n        [buttons]=\"config.rightSideButtons\"\r\n        (buttonClick)=\"buttonClick($event)\"\r\n        class=\"custom-dialog__footer__buttons-wrapper\"\r\n    ></app-custom-dialog-buttons-wrapper>\r\n    <app-custom-dialog-buttons-wrapper\r\n        [buttons]=\"config.leftSideButtons\"\r\n        (buttonClick)=\"buttonClick($event)\"\r\n        class=\"custom-dialog__footer__buttons-wrapper\"\r\n    ></app-custom-dialog-buttons-wrapper>\r\n</div>\r\n", styles: [""], dependencies: [{ kind: "directive", type: i1$1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.DefaultLayoutDirective, selector: "  [fxLayout], [fxLayout.xs], [fxLayout.sm], [fxLayout.md],  [fxLayout.lg], [fxLayout.xl], [fxLayout.lt-sm], [fxLayout.lt-md],  [fxLayout.lt-lg], [fxLayout.lt-xl], [fxLayout.gt-xs], [fxLayout.gt-sm],  [fxLayout.gt-md], [fxLayout.gt-lg]", inputs: ["fxLayout", "fxLayout.xs", "fxLayout.sm", "fxLayout.md", "fxLayout.lg", "fxLayout.xl", "fxLayout.lt-sm", "fxLayout.lt-md", "fxLayout.lt-lg", "fxLayout.lt-xl", "fxLayout.gt-xs", "fxLayout.gt-sm", "fxLayout.gt-md", "fxLayout.gt-lg"] }, { kind: "directive", type: i3.DefaultLayoutAlignDirective, selector: "  [fxLayoutAlign], [fxLayoutAlign.xs], [fxLayoutAlign.sm], [fxLayoutAlign.md],  [fxLayoutAlign.lg], [fxLayoutAlign.xl], [fxLayoutAlign.lt-sm], [fxLayoutAlign.lt-md],  [fxLayoutAlign.lt-lg], [fxLayoutAlign.lt-xl], [fxLayoutAlign.gt-xs], [fxLayoutAlign.gt-sm],  [fxLayoutAlign.gt-md], [fxLayoutAlign.gt-lg]", inputs: ["fxLayoutAlign", "fxLayoutAlign.xs", "fxLayoutAlign.sm", "fxLayoutAlign.md", "fxLayoutAlign.lg", "fxLayoutAlign.xl", "fxLayoutAlign.lt-sm", "fxLayoutAlign.lt-md", "fxLayoutAlign.lt-lg", "fxLayoutAlign.lt-xl", "fxLayoutAlign.gt-xs", "fxLayoutAlign.gt-sm", "fxLayoutAlign.gt-md", "fxLayoutAlign.gt-lg"] }, { kind: "component", type: CustomDialogButtonsWrapperComponent, selector: "app-custom-dialog-buttons-wrapper", inputs: ["buttons"], outputs: ["buttonClick"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogFooterComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-custom-dialog-footer', template: "<div\r\n    class=\"custom-dialog__footer\"\r\n    fxLayout=\"row-reverse\"\r\n    fxLayout.xs=\"column\"\r\n    fxLayoutAlign=\"start start\"\r\n    fxLayoutAlign.gt-xs=\"space-between center\"\r\n    *ngIf=\"config?.show\"\r\n>\r\n    <app-custom-dialog-buttons-wrapper\r\n        [buttons]=\"config.rightSideButtons\"\r\n        (buttonClick)=\"buttonClick($event)\"\r\n        class=\"custom-dialog__footer__buttons-wrapper\"\r\n    ></app-custom-dialog-buttons-wrapper>\r\n    <app-custom-dialog-buttons-wrapper\r\n        [buttons]=\"config.leftSideButtons\"\r\n        (buttonClick)=\"buttonClick($event)\"\r\n        class=\"custom-dialog__footer__buttons-wrapper\"\r\n    ></app-custom-dialog-buttons-wrapper>\r\n</div>\r\n" }]
        }], ctorParameters: function () { return []; }, propDecorators: { config: [{
                type: Input
            }], close: [{
                type: Output
            }], submit: [{
                type: Output
            }] } });

let CustomDialogComponent = class CustomDialogComponent {
    constructor(dialogRef, customDialogService, config) {
        this.dialogRef = dialogRef;
        this.customDialogService = customDialogService;
        this.config = config;
        this.headerConfig = {};
    }
    ngOnInit() {
        this.customDialogService.closeResult$
            .pipe(untilDestroyed(this))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .subscribe((data) => {
            if (data.id === this.componentRef?.instance.MODAL_ID) {
                this.close(data.result);
            }
        });
    }
    ngAfterViewInit() {
        this.loadInnerModalComponent();
        setTimeout(() => {
            this.changeTitle();
            this.getComponentConfiguration();
        });
    }
    ngOnDestroy() {
        this.componentRef?.destroy();
    }
    closeAction() {
        if (this.componentRef?.instance.confirmCloseCustomDialog) {
            this.componentRef.instance
                .confirmCloseCustomDialog()
                .pipe(take(1))
                .subscribe({
                next: (ok) => {
                    if (ok) {
                        this.close(false);
                    }
                },
                error: (error) => {
                    console.log(error);
                },
            });
        }
        else {
            this.close(false);
        }
    }
    submitAction() {
        if (this.componentRef?.instance.onSubmitCustomDialog) {
            this.componentRef.instance
                .onSubmitCustomDialog()
                .pipe(take(1))
                .subscribe({
                next: (ok) => {
                    if (ok) {
                        this.close(ok);
                    }
                },
                error: (error) => {
                    console.log(error);
                },
            });
        }
        else {
            this.close(true);
        }
    }
    changeTitle() {
        this.headerConfig.titleLabel = this.componentRef?.instance.MODAL_TITLE;
    }
    loadInnerModalComponent() {
        this.componentRef = this.dynamicViewContainer?.createComponent(this.config.component);
        this.componentRef?.instance.setModalModeActive(true);
        if (this.config.extendedComponentData && this.componentRef) {
            this.componentRef.instance.extendedComponentData =
                this.config.extendedComponentData;
        }
    }
    getComponentConfiguration() {
        this.footerConfig = new CustomDialogFooterConfig(this.componentRef.instance.setAndGetFooterConfig());
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    close(result) {
        this.dialogRef.close(result);
    }
};
CustomDialogComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogComponent, deps: [{ token: i1$2.MatDialogRef }, { token: CustomDialogService }, { token: MAT_DIALOG_DATA }], target: i0.ɵɵFactoryTarget.Component });
CustomDialogComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.3", type: CustomDialogComponent, selector: "app-custom-dialog", viewQueries: [{ propertyName: "dynamicViewContainer", first: true, predicate: ["customContainerRef"], descendants: true, read: ViewContainerRef, static: true }], ngImport: i0, template: "<div class=\"custom-dialog\">\r\n    <app-custom-dialog-header [config]=\"headerConfig\" (close)=\"closeAction()\"></app-custom-dialog-header>\r\n    <mat-divider class=\"custom-dialog__divider\"></mat-divider>\r\n    <div class=\"custom-dialog__content\">\r\n        <ng-container #customContainerRef></ng-container>\r\n    </div>\r\n    <mat-divider class=\"custom-dialog__divider\"></mat-divider>\r\n    <app-custom-dialog-footer\r\n        [config]=\"footerConfig\"\r\n        (close)=\"closeAction()\"\r\n        (submit)=\"submitAction()\"\r\n    ></app-custom-dialog-footer>\r\n</div>\r\n", styles: [".custom-dialog__content{max-height:67vh;overflow-y:auto;overflow-x:hidden}@media (max-height: 697px){.custom-dialog__content{max-height:60vh}}@media (max-height: 500px){.custom-dialog__content{max-height:55vh}}@media (max-height: 410px){.custom-dialog__content{max-height:50vh}}@media (max-height: 350px){.custom-dialog__content{max-height:45vh}}@media (max-height: 315px){.custom-dialog__content{max-height:40vh}}@media (max-height: 300px){.custom-dialog__content{max-height:35vh}}.custom-dialog__divider{margin:15px 0;padding:0}\n"], dependencies: [{ kind: "component", type: i3$1.MatDivider, selector: "mat-divider", inputs: ["vertical", "inset"] }, { kind: "component", type: CustomDialogHeaderComponent, selector: "app-custom-dialog-header", inputs: ["config"], outputs: ["close"] }, { kind: "component", type: CustomDialogFooterComponent, selector: "app-custom-dialog-footer", inputs: ["config"], outputs: ["close", "submit"] }] });
CustomDialogComponent = __decorate([
    UntilDestroy()
], CustomDialogComponent);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-custom-dialog', template: "<div class=\"custom-dialog\">\r\n    <app-custom-dialog-header [config]=\"headerConfig\" (close)=\"closeAction()\"></app-custom-dialog-header>\r\n    <mat-divider class=\"custom-dialog__divider\"></mat-divider>\r\n    <div class=\"custom-dialog__content\">\r\n        <ng-container #customContainerRef></ng-container>\r\n    </div>\r\n    <mat-divider class=\"custom-dialog__divider\"></mat-divider>\r\n    <app-custom-dialog-footer\r\n        [config]=\"footerConfig\"\r\n        (close)=\"closeAction()\"\r\n        (submit)=\"submitAction()\"\r\n    ></app-custom-dialog-footer>\r\n</div>\r\n", styles: [".custom-dialog__content{max-height:67vh;overflow-y:auto;overflow-x:hidden}@media (max-height: 697px){.custom-dialog__content{max-height:60vh}}@media (max-height: 500px){.custom-dialog__content{max-height:55vh}}@media (max-height: 410px){.custom-dialog__content{max-height:50vh}}@media (max-height: 350px){.custom-dialog__content{max-height:45vh}}@media (max-height: 315px){.custom-dialog__content{max-height:40vh}}@media (max-height: 300px){.custom-dialog__content{max-height:35vh}}.custom-dialog__divider{margin:15px 0;padding:0}\n"] }]
        }], ctorParameters: function () { return [{ type: i1$2.MatDialogRef }, { type: CustomDialogService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }]; }, propDecorators: { dynamicViewContainer: [{
                type: ViewChild,
                args: ['customContainerRef', { read: ViewContainerRef, static: true }]
            }] } });

class CustomDialogService {
    constructor(dialog) {
        this.dialog = dialog;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.closeResult$ = new Subject();
    }
    /**
     * @functio open a custom dialog
     *
     * @param config: CustomDialogConfigI
     *
     * @returns an `Observable<any>` which will be resolved
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    open(config) {
        const { maxWidth, minWidth, width, maxHeight, minHeight, height, disableClose, component, id, panelClass, extendedComponentData, } = config;
        const dialogRef = this.dialog.open(CustomDialogComponent, {
            id,
            panelClass,
            maxWidth,
            minWidth,
            width,
            maxHeight,
            minHeight,
            height,
            disableClose,
            data: {
                component,
                extendedComponentData,
            },
        });
        return dialogRef.afterClosed();
    }
    /**
     * @function close
     * @param id of the dialog to close
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    close(id, result) {
        if (result) {
            this.closeResult$.next({ id, result });
        }
        else {
            this.dialog.getDialogById(id)?.close();
        }
    }
}
CustomDialogService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogService, deps: [{ token: i1$2.MatDialog }], target: i0.ɵɵFactoryTarget.Injectable });
CustomDialogService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i1$2.MatDialog }]; } });

class Loader {
    constructor() {
        this.translations = new Subject();
        this.$translations = this.translations.asObservable();
    }
    getTranslation(lang) {
        return this.$translations;
    }
}
function LoaderFactory() {
    return new Loader();
}
class CustomDialogModule {
}
CustomDialogModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
CustomDialogModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogModule, declarations: [CustomDialogComponent,
        CustomDialogHeaderComponent,
        CustomDialogFooterComponent,
        CustomDialogButtonsWrapperComponent], imports: [CommonModule, i4.TranslateModule, MatButtonModule,
        MatDividerModule,
        MatDialogModule,
        MatIconModule,
        FlexLayoutModule,
        ReactiveFormsModule], exports: [TranslateModule] });
CustomDialogModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogModule, imports: [CommonModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: LoaderFactory,
            },
        }),
        MatButtonModule,
        MatDividerModule,
        MatDialogModule,
        MatIconModule,
        FlexLayoutModule,
        ReactiveFormsModule, TranslateModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        CustomDialogComponent,
                        CustomDialogHeaderComponent,
                        CustomDialogFooterComponent,
                        CustomDialogButtonsWrapperComponent,
                    ],
                    imports: [
                        CommonModule,
                        TranslateModule.forChild({
                            loader: {
                                provide: TranslateLoader,
                                useFactory: LoaderFactory,
                            },
                        }),
                        MatButtonModule,
                        MatDividerModule,
                        MatDialogModule,
                        MatIconModule,
                        FlexLayoutModule,
                        ReactiveFormsModule,
                    ],
                    exports: [TranslateModule],
                }]
        }] });

/**
 * @abstract @class ComponentToExtendForCustomDialog
 * @override confirmCloseCustomDialog function
 * @override onSubmitCustomDialog function
 * @override setAndGetFooterConfig function
 */
class ComponentToExtendForCustomDialog {
    /**
     * @constructor ComponentToExtendForCustomDialog
     * @param MODAL_ID id used to reference the dialog modal
     * @param MODAL_PANEL_CLASS class used in the dialog modal
     * @param MODAL_TITLE? title for the modal
     */
    constructor(MODAL_ID, MODAL_PANEL_CLASS, MODAL_TITLE) {
        this.MODAL_ID = MODAL_ID;
        this.MODAL_PANEL_CLASS = MODAL_PANEL_CLASS;
        this.MODAL_TITLE = MODAL_TITLE;
        //Data passed from customDialogService
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.extendedComponentData = null;
        //If component is created throgh CustomDialgoService modalModeActive is set to true
        this.modalModeActive = false;
    }
    //If component is created throgh CustomDialgoService this function is called
    setModalModeActive(active) {
        this.modalModeActive = active;
    }
    /**
     * isModalModeActive
     *
     * @returns boolean if modal mode is active
     */
    isModalModeActive() {
        return this.modalModeActive;
    }
}

/*
 * Public API Surface of custom-dialog
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ComponentToExtendForCustomDialog, CustomDialogModule, CustomDialogService };
//# sourceMappingURL=frontend-custom-dialog.mjs.map
