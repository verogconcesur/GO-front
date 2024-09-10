import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomDialogComponent } from './custom-dialog.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomDialogHeaderComponent } from './components/custom-dialog-header/custom-dialog-header.component';
import { CustomDialogFooterComponent } from './components/custom-dialog-footer/custom-dialog-footer.component';
// eslint-disable-next-line max-len
import { CustomDialogButtonsWrapperComponent } from './components/custom-dialog-buttons-wrapper/custom-dialog-buttons-wrapper.component';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import * as i0 from "@angular/core";
import * as i1 from "@ngx-translate/core";
export class Loader {
    constructor() {
        this.translations = new Subject();
        this.$translations = this.translations.asObservable();
    }
    getTranslation(lang) {
        return this.$translations;
    }
}
export function LoaderFactory() {
    return new Loader();
}
export class CustomDialogModule {
}
CustomDialogModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
CustomDialogModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.3", ngImport: i0, type: CustomDialogModule, declarations: [CustomDialogComponent,
        CustomDialogHeaderComponent,
        CustomDialogFooterComponent,
        CustomDialogButtonsWrapperComponent], imports: [CommonModule, i1.TranslateModule, MatButtonModule,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLWRpYWxvZy5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9jdXN0b20tZGlhbG9nL3NyYy9saWIvY3VzdG9tLWRpYWxvZy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFL0MsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxrRUFBa0UsQ0FBQztBQUMvRyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxrRUFBa0UsQ0FBQztBQUMvRyxtQ0FBbUM7QUFDbkMsT0FBTyxFQUFFLG1DQUFtQyxFQUFFLE1BQU0sb0ZBQW9GLENBQUM7QUFDekksT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQzs7O0FBRXZELE1BQU0sT0FBTyxNQUFNO0lBQW5CO1FBQ1UsaUJBQVksR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3JDLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUluRCxDQUFDO0lBSEMsY0FBYyxDQUFDLElBQVk7UUFDekIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCLENBQUM7Q0FDRjtBQUVELE1BQU0sVUFBVSxhQUFhO0lBQzNCLE9BQU8sSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUN0QixDQUFDO0FBMEJELE1BQU0sT0FBTyxrQkFBa0I7OytHQUFsQixrQkFBa0I7Z0hBQWxCLGtCQUFrQixpQkF0QjNCLHFCQUFxQjtRQUNyQiwyQkFBMkI7UUFDM0IsMkJBQTJCO1FBQzNCLG1DQUFtQyxhQUduQyxZQUFZLHNCQU9aLGVBQWU7UUFDZixnQkFBZ0I7UUFDaEIsZUFBZTtRQUNmLGFBQWE7UUFDYixnQkFBZ0I7UUFDaEIsbUJBQW1CLGFBRVgsZUFBZTtnSEFFZCxrQkFBa0IsWUFoQjNCLFlBQVk7UUFDWixlQUFlLENBQUMsUUFBUSxDQUFDO1lBQ3ZCLE1BQU0sRUFBRTtnQkFDTixPQUFPLEVBQUUsZUFBZTtnQkFDeEIsVUFBVSxFQUFFLGFBQWE7YUFDMUI7U0FDRixDQUFDO1FBQ0YsZUFBZTtRQUNmLGdCQUFnQjtRQUNoQixlQUFlO1FBQ2YsYUFBYTtRQUNiLGdCQUFnQjtRQUNoQixtQkFBbUIsRUFFWCxlQUFlOzJGQUVkLGtCQUFrQjtrQkF4QjlCLFFBQVE7bUJBQUM7b0JBQ1IsWUFBWSxFQUFFO3dCQUNaLHFCQUFxQjt3QkFDckIsMkJBQTJCO3dCQUMzQiwyQkFBMkI7d0JBQzNCLG1DQUFtQztxQkFDcEM7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osZUFBZSxDQUFDLFFBQVEsQ0FBQzs0QkFDdkIsTUFBTSxFQUFFO2dDQUNOLE9BQU8sRUFBRSxlQUFlO2dDQUN4QixVQUFVLEVBQUUsYUFBYTs2QkFDMUI7eUJBQ0YsQ0FBQzt3QkFDRixlQUFlO3dCQUNmLGdCQUFnQjt3QkFDaEIsZUFBZTt3QkFDZixhQUFhO3dCQUNiLGdCQUFnQjt3QkFDaEIsbUJBQW1CO3FCQUNwQjtvQkFDRCxPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUM7aUJBQzNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHsgQ3VzdG9tRGlhbG9nU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvY3VzdG9tLWRpYWxvZy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ3VzdG9tRGlhbG9nQ29tcG9uZW50IH0gZnJvbSAnLi9jdXN0b20tZGlhbG9nLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFRyYW5zbGF0ZU1vZHVsZSwgVHJhbnNsYXRlTG9hZGVyIH0gZnJvbSAnQG5neC10cmFuc2xhdGUvY29yZSc7XHJcbmltcG9ydCB7IEZsZXhMYXlvdXRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mbGV4LWxheW91dCc7XHJcbmltcG9ydCB7IFJlYWN0aXZlRm9ybXNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7IEN1c3RvbURpYWxvZ0hlYWRlckNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9jdXN0b20tZGlhbG9nLWhlYWRlci9jdXN0b20tZGlhbG9nLWhlYWRlci5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBDdXN0b21EaWFsb2dGb290ZXJDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvY3VzdG9tLWRpYWxvZy1mb290ZXIvY3VzdG9tLWRpYWxvZy1mb290ZXIuY29tcG9uZW50JztcclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1sZW5cclxuaW1wb3J0IHsgQ3VzdG9tRGlhbG9nQnV0dG9uc1dyYXBwZXJDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvY3VzdG9tLWRpYWxvZy1idXR0b25zLXdyYXBwZXIvY3VzdG9tLWRpYWxvZy1idXR0b25zLXdyYXBwZXIuY29tcG9uZW50JztcclxuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBNYXRCdXR0b25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24nO1xyXG5pbXBvcnQgeyBNYXREaXZpZGVyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGl2aWRlcic7XHJcbmltcG9ydCB7IE1hdERpYWxvZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XHJcbmltcG9ydCB7IE1hdEljb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pY29uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBMb2FkZXIgaW1wbGVtZW50cyBUcmFuc2xhdGVMb2FkZXIge1xyXG4gIHByaXZhdGUgdHJhbnNsYXRpb25zID0gbmV3IFN1YmplY3QoKTtcclxuICAkdHJhbnNsYXRpb25zID0gdGhpcy50cmFuc2xhdGlvbnMuYXNPYnNlcnZhYmxlKCk7XHJcbiAgZ2V0VHJhbnNsYXRpb24obGFuZzogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gdGhpcy4kdHJhbnNsYXRpb25zO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIExvYWRlckZhY3RvcnkoKSB7XHJcbiAgcmV0dXJuIG5ldyBMb2FkZXIoKTtcclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuICBkZWNsYXJhdGlvbnM6IFtcclxuICAgIEN1c3RvbURpYWxvZ0NvbXBvbmVudCxcclxuICAgIEN1c3RvbURpYWxvZ0hlYWRlckNvbXBvbmVudCxcclxuICAgIEN1c3RvbURpYWxvZ0Zvb3RlckNvbXBvbmVudCxcclxuICAgIEN1c3RvbURpYWxvZ0J1dHRvbnNXcmFwcGVyQ29tcG9uZW50LFxyXG4gIF0sXHJcbiAgaW1wb3J0czogW1xyXG4gICAgQ29tbW9uTW9kdWxlLFxyXG4gICAgVHJhbnNsYXRlTW9kdWxlLmZvckNoaWxkKHtcclxuICAgICAgbG9hZGVyOiB7XHJcbiAgICAgICAgcHJvdmlkZTogVHJhbnNsYXRlTG9hZGVyLFxyXG4gICAgICAgIHVzZUZhY3Rvcnk6IExvYWRlckZhY3RvcnksXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIE1hdEJ1dHRvbk1vZHVsZSxcclxuICAgIE1hdERpdmlkZXJNb2R1bGUsXHJcbiAgICBNYXREaWFsb2dNb2R1bGUsXHJcbiAgICBNYXRJY29uTW9kdWxlLFxyXG4gICAgRmxleExheW91dE1vZHVsZSxcclxuICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXHJcbiAgXSxcclxuICBleHBvcnRzOiBbVHJhbnNsYXRlTW9kdWxlXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIEN1c3RvbURpYWxvZ01vZHVsZSB7fVxyXG4iXX0=