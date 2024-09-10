import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CustomDialogComponent } from '../custom-dialog.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
export class CustomDialogService {
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
CustomDialogService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogService, deps: [{ token: i1.MatDialog }], target: i0.ɵɵFactoryTarget.Injectable });
CustomDialogService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i1.MatDialog }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLWRpYWxvZy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvY3VzdG9tLWRpYWxvZy9zcmMvbGliL3NlcnZpY2VzL2N1c3RvbS1kaWFsb2cuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7OztBQU1uRSxNQUFNLE9BQU8sbUJBQW1CO0lBRzlCLFlBQW9CLE1BQWlCO1FBQWpCLFdBQU0sR0FBTixNQUFNLENBQVc7UUFGckMsOERBQThEO1FBQ3ZELGlCQUFZLEdBQUcsSUFBSSxPQUFPLEVBQStCLENBQUM7SUFDekIsQ0FBQztJQUV6Qzs7Ozs7O09BTUc7SUFDSCw4REFBOEQ7SUFDdkQsSUFBSSxDQUFDLE1BQTJCO1FBQ3JDLE1BQU0sRUFDSixRQUFRLEVBQ1IsUUFBUSxFQUNSLEtBQUssRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULE1BQU0sRUFDTixZQUFZLEVBQ1osU0FBUyxFQUNULEVBQUUsRUFDRixVQUFVLEVBQ1YscUJBQXFCLEdBQ3RCLEdBQUcsTUFBTSxDQUFDO1FBQ1gsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7WUFDeEQsRUFBRTtZQUNGLFVBQVU7WUFDVixRQUFRO1lBQ1IsUUFBUTtZQUNSLEtBQUs7WUFDTCxTQUFTO1lBQ1QsU0FBUztZQUNULE1BQU07WUFDTixZQUFZO1lBQ1osSUFBSSxFQUFFO2dCQUNKLFNBQVM7Z0JBQ1QscUJBQXFCO2FBQ3RCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsT0FBTyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7T0FHRztJQUNILDhEQUE4RDtJQUN2RCxLQUFLLENBQUMsRUFBVSxFQUFFLE1BQVk7UUFDbkMsSUFBSSxNQUFNLEVBQUU7WUFDVixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3hDO2FBQU07WUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztTQUN4QztJQUNILENBQUM7O2dIQXpEVSxtQkFBbUI7b0hBQW5CLG1CQUFtQixjQUZsQixNQUFNOzJGQUVQLG1CQUFtQjtrQkFIL0IsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE1hdERpYWxvZyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgQ3VzdG9tRGlhbG9nQ29tcG9uZW50IH0gZnJvbSAnLi4vY3VzdG9tLWRpYWxvZy5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBDdXN0b21EaWFsb2dDb25maWdJIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9jdXN0b20tZGlhbG9nLWNvbmZpZyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ3VzdG9tRGlhbG9nU2VydmljZSB7XHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICBwdWJsaWMgY2xvc2VSZXN1bHQkID0gbmV3IFN1YmplY3Q8eyBpZDogc3RyaW5nOyByZXN1bHQ6IGFueSB9PigpO1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGlhbG9nOiBNYXREaWFsb2cpIHt9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBmdW5jdGlvIG9wZW4gYSBjdXN0b20gZGlhbG9nXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY29uZmlnOiBDdXN0b21EaWFsb2dDb25maWdJXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyBhbiBgT2JzZXJ2YWJsZTxhbnk+YCB3aGljaCB3aWxsIGJlIHJlc29sdmVkXHJcbiAgICovXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICBwdWJsaWMgb3Blbihjb25maWc6IEN1c3RvbURpYWxvZ0NvbmZpZ0kpOiBPYnNlcnZhYmxlPGFueT4ge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICBtYXhXaWR0aCxcclxuICAgICAgbWluV2lkdGgsXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBtYXhIZWlnaHQsXHJcbiAgICAgIG1pbkhlaWdodCxcclxuICAgICAgaGVpZ2h0LFxyXG4gICAgICBkaXNhYmxlQ2xvc2UsXHJcbiAgICAgIGNvbXBvbmVudCxcclxuICAgICAgaWQsXHJcbiAgICAgIHBhbmVsQ2xhc3MsXHJcbiAgICAgIGV4dGVuZGVkQ29tcG9uZW50RGF0YSxcclxuICAgIH0gPSBjb25maWc7XHJcbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLmRpYWxvZy5vcGVuKEN1c3RvbURpYWxvZ0NvbXBvbmVudCwge1xyXG4gICAgICBpZCxcclxuICAgICAgcGFuZWxDbGFzcyxcclxuICAgICAgbWF4V2lkdGgsXHJcbiAgICAgIG1pbldpZHRoLFxyXG4gICAgICB3aWR0aCxcclxuICAgICAgbWF4SGVpZ2h0LFxyXG4gICAgICBtaW5IZWlnaHQsXHJcbiAgICAgIGhlaWdodCxcclxuICAgICAgZGlzYWJsZUNsb3NlLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgY29tcG9uZW50LFxyXG4gICAgICAgIGV4dGVuZGVkQ29tcG9uZW50RGF0YSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBkaWFsb2dSZWYuYWZ0ZXJDbG9zZWQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBmdW5jdGlvbiBjbG9zZVxyXG4gICAqIEBwYXJhbSBpZCBvZiB0aGUgZGlhbG9nIHRvIGNsb3NlXHJcbiAgICovXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICBwdWJsaWMgY2xvc2UoaWQ6IHN0cmluZywgcmVzdWx0PzogYW55KTogdm9pZCB7XHJcbiAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgIHRoaXMuY2xvc2VSZXN1bHQkLm5leHQoeyBpZCwgcmVzdWx0IH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5kaWFsb2cuZ2V0RGlhbG9nQnlJZChpZCk/LmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==