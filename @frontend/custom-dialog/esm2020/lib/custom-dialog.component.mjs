import { __decorate } from "tslib";
import { Component, Inject, ViewChild, ViewContainerRef, } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { CustomDialogFooterConfig } from './models/custom-dialog-footer-config';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "./services/custom-dialog.service";
import * as i3 from "@angular/material/divider";
import * as i4 from "./components/custom-dialog-header/custom-dialog-header.component";
import * as i5 from "./components/custom-dialog-footer/custom-dialog-footer.component";
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
CustomDialogComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogComponent, deps: [{ token: i1.MatDialogRef }, { token: i2.CustomDialogService }, { token: MAT_DIALOG_DATA }], target: i0.ɵɵFactoryTarget.Component });
CustomDialogComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.3", type: CustomDialogComponent, selector: "app-custom-dialog", viewQueries: [{ propertyName: "dynamicViewContainer", first: true, predicate: ["customContainerRef"], descendants: true, read: ViewContainerRef, static: true }], ngImport: i0, template: "<div class=\"custom-dialog\">\r\n    <app-custom-dialog-header [config]=\"headerConfig\" (close)=\"closeAction()\"></app-custom-dialog-header>\r\n    <mat-divider class=\"custom-dialog__divider\"></mat-divider>\r\n    <div class=\"custom-dialog__content\">\r\n        <ng-container #customContainerRef></ng-container>\r\n    </div>\r\n    <mat-divider class=\"custom-dialog__divider\"></mat-divider>\r\n    <app-custom-dialog-footer\r\n        [config]=\"footerConfig\"\r\n        (close)=\"closeAction()\"\r\n        (submit)=\"submitAction()\"\r\n    ></app-custom-dialog-footer>\r\n</div>\r\n", styles: [".custom-dialog__content{max-height:67vh;overflow-y:auto;overflow-x:hidden}@media (max-height: 697px){.custom-dialog__content{max-height:60vh}}@media (max-height: 500px){.custom-dialog__content{max-height:55vh}}@media (max-height: 410px){.custom-dialog__content{max-height:50vh}}@media (max-height: 350px){.custom-dialog__content{max-height:45vh}}@media (max-height: 315px){.custom-dialog__content{max-height:40vh}}@media (max-height: 300px){.custom-dialog__content{max-height:35vh}}.custom-dialog__divider{margin:15px 0;padding:0}\n"], dependencies: [{ kind: "component", type: i3.MatDivider, selector: "mat-divider", inputs: ["vertical", "inset"] }, { kind: "component", type: i4.CustomDialogHeaderComponent, selector: "app-custom-dialog-header", inputs: ["config"], outputs: ["close"] }, { kind: "component", type: i5.CustomDialogFooterComponent, selector: "app-custom-dialog-footer", inputs: ["config"], outputs: ["close", "submit"] }] });
CustomDialogComponent = __decorate([
    UntilDestroy()
], CustomDialogComponent);
export { CustomDialogComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-custom-dialog', template: "<div class=\"custom-dialog\">\r\n    <app-custom-dialog-header [config]=\"headerConfig\" (close)=\"closeAction()\"></app-custom-dialog-header>\r\n    <mat-divider class=\"custom-dialog__divider\"></mat-divider>\r\n    <div class=\"custom-dialog__content\">\r\n        <ng-container #customContainerRef></ng-container>\r\n    </div>\r\n    <mat-divider class=\"custom-dialog__divider\"></mat-divider>\r\n    <app-custom-dialog-footer\r\n        [config]=\"footerConfig\"\r\n        (close)=\"closeAction()\"\r\n        (submit)=\"submitAction()\"\r\n    ></app-custom-dialog-footer>\r\n</div>\r\n", styles: [".custom-dialog__content{max-height:67vh;overflow-y:auto;overflow-x:hidden}@media (max-height: 697px){.custom-dialog__content{max-height:60vh}}@media (max-height: 500px){.custom-dialog__content{max-height:55vh}}@media (max-height: 410px){.custom-dialog__content{max-height:50vh}}@media (max-height: 350px){.custom-dialog__content{max-height:45vh}}@media (max-height: 315px){.custom-dialog__content{max-height:40vh}}@media (max-height: 300px){.custom-dialog__content{max-height:35vh}}.custom-dialog__divider{margin:15px 0;padding:0}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.MatDialogRef }, { type: i2.CustomDialogService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }]; }, propDecorators: { dynamicViewContainer: [{
                type: ViewChild,
                args: ['customContainerRef', { read: ViewContainerRef, static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLWRpYWxvZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9jdXN0b20tZGlhbG9nL3NyYy9saWIvY3VzdG9tLWRpYWxvZy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi9wcm9qZWN0cy9jdXN0b20tZGlhbG9nL3NyYy9saWIvY3VzdG9tLWRpYWxvZy5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUVMLFNBQVMsRUFFVCxNQUFNLEVBR04sU0FBUyxFQUNULGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWdCLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSXpFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0QyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUVoRixPQUFPLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7Ozs7O0FBUTlELElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCO0lBT2hDLFlBQ1MsU0FBeUQsRUFDeEQsbUJBQXdDLEVBQ2hCLE1BQTJCO1FBRnBELGNBQVMsR0FBVCxTQUFTLENBQWdEO1FBQ3hELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7UUFQdEQsaUJBQVksR0FBOEIsRUFBRSxDQUFDO0lBUWpELENBQUM7SUFFSixRQUFRO1FBQ04sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVk7YUFDbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQiw4REFBOEQ7YUFDN0QsU0FBUyxDQUFDLENBQUMsSUFBaUMsRUFBRSxFQUFFO1lBQy9DLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3pCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQy9CLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVNLFdBQVc7UUFDaEIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRTtZQUN4RCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVE7aUJBQ3ZCLHdCQUF3QixFQUFFO2lCQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNiLFNBQVMsQ0FBQztnQkFDVCxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtvQkFDWCxJQUFJLEVBQUUsRUFBRTt3QkFDTixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUNuQjtnQkFDSCxDQUFDO2dCQUNELEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JCLENBQUM7YUFDRixDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuQjtJQUNILENBQUM7SUFFTSxZQUFZO1FBQ2pCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsb0JBQW9CLEVBQUU7WUFDcEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRO2lCQUN2QixvQkFBb0IsRUFBRTtpQkFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDYixTQUFTLENBQUM7Z0JBQ1QsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLEVBQUU7d0JBQ04sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDaEI7Z0JBQ0gsQ0FBQztnQkFDRCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtvQkFDZixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNMLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEI7SUFDSCxDQUFDO0lBRU0sV0FBVztRQUNoQixJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUM7SUFDekUsQ0FBQztJQUVPLHVCQUF1QjtRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxlQUFlLENBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUN0QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDMUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMscUJBQXFCO2dCQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztJQUVPLHlCQUF5QjtRQUMvQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksd0JBQXdCLENBQzlDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQ25ELENBQUM7SUFDSixDQUFDO0lBRUQsOERBQThEO0lBQ3RELEtBQUssQ0FBQyxNQUFXO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7O2tIQXBHVSxxQkFBcUIsaUZBVXRCLGVBQWU7c0dBVmQscUJBQXFCLGdLQUNTLGdCQUFnQiwyQ0MxQjNELHFsQkFhQTtBRFlhLHFCQUFxQjtJQU5qQyxZQUFZLEVBQUU7R0FNRixxQkFBcUIsQ0FxR2pDO1NBckdZLHFCQUFxQjsyRkFBckIscUJBQXFCO2tCQUxqQyxTQUFTOytCQUNFLG1CQUFtQjs7MEJBYzFCLE1BQU07MkJBQUMsZUFBZTs0Q0FSbEIsb0JBQW9CO3NCQUQxQixTQUFTO3VCQUFDLG9CQUFvQixFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIEFmdGVyVmlld0luaXQsXHJcbiAgQ29tcG9uZW50LFxyXG4gIENvbXBvbmVudFJlZixcclxuICBJbmplY3QsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBWaWV3Q2hpbGQsXHJcbiAgVmlld0NvbnRhaW5lclJlZixcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTWF0RGlhbG9nUmVmLCBNQVRfRElBTE9HX0RBVEEgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xyXG5pbXBvcnQgeyBDb21wb25lbnRUb0V4dGVuZEZvckN1c3RvbURpYWxvZyB9IGZyb20gJy4vbW9kZWxzL2NvbXBvbmVudC1mb3ItY3VzdG9tLWRpYWxvZyc7XHJcbmltcG9ydCB7IEN1c3RvbURpYWxvZ0NvbmZpZ0kgfSBmcm9tICcuL2ludGVyZmFjZXMvY3VzdG9tLWRpYWxvZy1jb25maWcnO1xyXG5pbXBvcnQgeyBDdXN0b21EaWFsb2dIZWFkZXJDb25maWdJIH0gZnJvbSAnLi9pbnRlcmZhY2VzL2N1c3RvbS1kaWFsb2ctaGVhZGVyLWNvbmZpZyc7XHJcbmltcG9ydCB7IHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEN1c3RvbURpYWxvZ0Zvb3RlckNvbmZpZyB9IGZyb20gJy4vbW9kZWxzL2N1c3RvbS1kaWFsb2ctZm9vdGVyLWNvbmZpZyc7XHJcbmltcG9ydCB7IEN1c3RvbURpYWxvZ1NlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2N1c3RvbS1kaWFsb2cuc2VydmljZSc7XHJcbmltcG9ydCB7IFVudGlsRGVzdHJveSwgdW50aWxEZXN0cm95ZWQgfSBmcm9tICdAbmduZWF0L3VudGlsLWRlc3Ryb3knO1xyXG5cclxuQFVudGlsRGVzdHJveSgpXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnYXBwLWN1c3RvbS1kaWFsb2cnLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9jdXN0b20tZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9jdXN0b20tZGlhbG9nLmNvbXBvbmVudC5zY3NzJ10sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDdXN0b21EaWFsb2dDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcbiAgQFZpZXdDaGlsZCgnY3VzdG9tQ29udGFpbmVyUmVmJywgeyByZWFkOiBWaWV3Q29udGFpbmVyUmVmLCBzdGF0aWM6IHRydWUgfSlcclxuICBwdWJsaWMgZHluYW1pY1ZpZXdDb250YWluZXIhOiBWaWV3Q29udGFpbmVyUmVmO1xyXG4gIHB1YmxpYyBoZWFkZXJDb25maWc6IEN1c3RvbURpYWxvZ0hlYWRlckNvbmZpZ0kgPSB7fTtcclxuICBwdWJsaWMgZm9vdGVyQ29uZmlnITogQ3VzdG9tRGlhbG9nRm9vdGVyQ29uZmlnO1xyXG4gIHByaXZhdGUgY29tcG9uZW50UmVmITogQ29tcG9uZW50UmVmPENvbXBvbmVudFRvRXh0ZW5kRm9yQ3VzdG9tRGlhbG9nPjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgZGlhbG9nUmVmOiBNYXREaWFsb2dSZWY8Q29tcG9uZW50VG9FeHRlbmRGb3JDdXN0b21EaWFsb2c+LFxyXG4gICAgcHJpdmF0ZSBjdXN0b21EaWFsb2dTZXJ2aWNlOiBDdXN0b21EaWFsb2dTZXJ2aWNlLFxyXG4gICAgQEluamVjdChNQVRfRElBTE9HX0RBVEEpIHB1YmxpYyBjb25maWc6IEN1c3RvbURpYWxvZ0NvbmZpZ0lcclxuICApIHt9XHJcblxyXG4gIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jdXN0b21EaWFsb2dTZXJ2aWNlLmNsb3NlUmVzdWx0JFxyXG4gICAgICAucGlwZSh1bnRpbERlc3Ryb3llZCh0aGlzKSlcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgICAgLnN1YnNjcmliZSgoZGF0YTogeyBpZDogc3RyaW5nOyByZXN1bHQ6IGFueSB9KSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaWQgPT09IHRoaXMuY29tcG9uZW50UmVmPy5pbnN0YW5jZS5NT0RBTF9JRCkge1xyXG4gICAgICAgICAgdGhpcy5jbG9zZShkYXRhLnJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcclxuICAgIHRoaXMubG9hZElubmVyTW9kYWxDb21wb25lbnQoKTtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLmNoYW5nZVRpdGxlKCk7XHJcbiAgICAgIHRoaXMuZ2V0Q29tcG9uZW50Q29uZmlndXJhdGlvbigpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMuY29tcG9uZW50UmVmPy5kZXN0cm95KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2xvc2VBY3Rpb24oKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5jb21wb25lbnRSZWY/Lmluc3RhbmNlLmNvbmZpcm1DbG9zZUN1c3RvbURpYWxvZykge1xyXG4gICAgICB0aGlzLmNvbXBvbmVudFJlZi5pbnN0YW5jZVxyXG4gICAgICAgIC5jb25maXJtQ2xvc2VDdXN0b21EaWFsb2coKVxyXG4gICAgICAgIC5waXBlKHRha2UoMSkpXHJcbiAgICAgICAgLnN1YnNjcmliZSh7XHJcbiAgICAgICAgICBuZXh0OiAob2spID0+IHtcclxuICAgICAgICAgICAgaWYgKG9rKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5jbG9zZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBlcnJvcjogKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmNsb3NlKGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdWJtaXRBY3Rpb24oKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5jb21wb25lbnRSZWY/Lmluc3RhbmNlLm9uU3VibWl0Q3VzdG9tRGlhbG9nKSB7XHJcbiAgICAgIHRoaXMuY29tcG9uZW50UmVmLmluc3RhbmNlXHJcbiAgICAgICAgLm9uU3VibWl0Q3VzdG9tRGlhbG9nKClcclxuICAgICAgICAucGlwZSh0YWtlKDEpKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoe1xyXG4gICAgICAgICAgbmV4dDogKG9rKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChvaykge1xyXG4gICAgICAgICAgICAgIHRoaXMuY2xvc2Uob2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXJyb3I6IChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5jbG9zZSh0cnVlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBjaGFuZ2VUaXRsZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuaGVhZGVyQ29uZmlnLnRpdGxlTGFiZWwgPSB0aGlzLmNvbXBvbmVudFJlZj8uaW5zdGFuY2UuTU9EQUxfVElUTEU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxvYWRJbm5lck1vZGFsQ29tcG9uZW50KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jb21wb25lbnRSZWYgPSB0aGlzLmR5bmFtaWNWaWV3Q29udGFpbmVyPy5jcmVhdGVDb21wb25lbnQoXHJcbiAgICAgIHRoaXMuY29uZmlnLmNvbXBvbmVudFxyXG4gICAgKTtcclxuICAgIHRoaXMuY29tcG9uZW50UmVmPy5pbnN0YW5jZS5zZXRNb2RhbE1vZGVBY3RpdmUodHJ1ZSk7XHJcbiAgICBpZiAodGhpcy5jb25maWcuZXh0ZW5kZWRDb21wb25lbnREYXRhICYmIHRoaXMuY29tcG9uZW50UmVmKSB7XHJcbiAgICAgIHRoaXMuY29tcG9uZW50UmVmLmluc3RhbmNlLmV4dGVuZGVkQ29tcG9uZW50RGF0YSA9XHJcbiAgICAgICAgdGhpcy5jb25maWcuZXh0ZW5kZWRDb21wb25lbnREYXRhO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRDb21wb25lbnRDb25maWd1cmF0aW9uKCk6IHZvaWQge1xyXG4gICAgdGhpcy5mb290ZXJDb25maWcgPSBuZXcgQ3VzdG9tRGlhbG9nRm9vdGVyQ29uZmlnKFxyXG4gICAgICB0aGlzLmNvbXBvbmVudFJlZi5pbnN0YW5jZS5zZXRBbmRHZXRGb290ZXJDb25maWcoKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgcHJpdmF0ZSBjbG9zZShyZXN1bHQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5kaWFsb2dSZWYuY2xvc2UocmVzdWx0KTtcclxuICB9XHJcbn1cclxuIiwiPGRpdiBjbGFzcz1cImN1c3RvbS1kaWFsb2dcIj5cclxuICAgIDxhcHAtY3VzdG9tLWRpYWxvZy1oZWFkZXIgW2NvbmZpZ109XCJoZWFkZXJDb25maWdcIiAoY2xvc2UpPVwiY2xvc2VBY3Rpb24oKVwiPjwvYXBwLWN1c3RvbS1kaWFsb2ctaGVhZGVyPlxyXG4gICAgPG1hdC1kaXZpZGVyIGNsYXNzPVwiY3VzdG9tLWRpYWxvZ19fZGl2aWRlclwiPjwvbWF0LWRpdmlkZXI+XHJcbiAgICA8ZGl2IGNsYXNzPVwiY3VzdG9tLWRpYWxvZ19fY29udGVudFwiPlxyXG4gICAgICAgIDxuZy1jb250YWluZXIgI2N1c3RvbUNvbnRhaW5lclJlZj48L25nLWNvbnRhaW5lcj5cclxuICAgIDwvZGl2PlxyXG4gICAgPG1hdC1kaXZpZGVyIGNsYXNzPVwiY3VzdG9tLWRpYWxvZ19fZGl2aWRlclwiPjwvbWF0LWRpdmlkZXI+XHJcbiAgICA8YXBwLWN1c3RvbS1kaWFsb2ctZm9vdGVyXHJcbiAgICAgICAgW2NvbmZpZ109XCJmb290ZXJDb25maWdcIlxyXG4gICAgICAgIChjbG9zZSk9XCJjbG9zZUFjdGlvbigpXCJcclxuICAgICAgICAoc3VibWl0KT1cInN1Ym1pdEFjdGlvbigpXCJcclxuICAgID48L2FwcC1jdXN0b20tZGlhbG9nLWZvb3Rlcj5cclxuPC9kaXY+XHJcbiJdfQ==