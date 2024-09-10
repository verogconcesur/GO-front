import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BreadCrumbsService } from './services/bread-crumbs.service';
import { BreadCrumbsComponent } from './component/bread-crumbs.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
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
export class BreadCrumbsModule {
}
BreadCrumbsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
BreadCrumbsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsModule, declarations: [BreadCrumbsComponent], imports: [CommonModule, i1.TranslateModule, RouterModule,
        MatButtonModule,
        MatIconModule,
        FlexLayoutModule], exports: [TranslateModule, BreadCrumbsComponent] });
BreadCrumbsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsModule, imports: [CommonModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: LoaderFactory,
            },
        }),
        RouterModule,
        MatButtonModule,
        MatIconModule,
        FlexLayoutModule, TranslateModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [BreadCrumbsComponent],
                    imports: [
                        CommonModule,
                        TranslateModule.forChild({
                            loader: {
                                provide: TranslateLoader,
                                useFactory: LoaderFactory,
                            },
                        }),
                        RouterModule,
                        MatButtonModule,
                        MatIconModule,
                        FlexLayoutModule,
                    ],
                    exports: [TranslateModule, BreadCrumbsComponent],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWQtY3J1bWJzLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2JyZWFkLWNydW1icy9zcmMvbGliL2JyZWFkLWNydW1icy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0Msd0VBQXdFO0FBQ3hFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdkUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQzs7O0FBRXZELE1BQU0sT0FBTyxNQUFNO0lBQW5CO1FBQ1UsaUJBQVksR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3JDLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUluRCxDQUFDO0lBSEMsY0FBYyxDQUFDLElBQVk7UUFDekIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCLENBQUM7Q0FDRjtBQUVELE1BQU0sVUFBVSxhQUFhO0lBQzNCLE9BQU8sSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUN0QixDQUFDO0FBbUJELE1BQU0sT0FBTyxpQkFBaUI7OzhHQUFqQixpQkFBaUI7K0dBQWpCLGlCQUFpQixpQkFoQmIsb0JBQW9CLGFBRWpDLFlBQVksc0JBT1osWUFBWTtRQUNaLGVBQWU7UUFDZixhQUFhO1FBQ2IsZ0JBQWdCLGFBRVIsZUFBZSxFQUFFLG9CQUFvQjsrR0FFcEMsaUJBQWlCLFlBZDFCLFlBQVk7UUFDWixlQUFlLENBQUMsUUFBUSxDQUFDO1lBQ3ZCLE1BQU0sRUFBRTtnQkFDTixPQUFPLEVBQUUsZUFBZTtnQkFDeEIsVUFBVSxFQUFFLGFBQWE7YUFDMUI7U0FDRixDQUFDO1FBQ0YsWUFBWTtRQUNaLGVBQWU7UUFDZixhQUFhO1FBQ2IsZ0JBQWdCLEVBRVIsZUFBZTsyRkFFZCxpQkFBaUI7a0JBakI3QixRQUFRO21CQUFDO29CQUNSLFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDO29CQUNwQyxPQUFPLEVBQUU7d0JBQ1AsWUFBWTt3QkFDWixlQUFlLENBQUMsUUFBUSxDQUFDOzRCQUN2QixNQUFNLEVBQUU7Z0NBQ04sT0FBTyxFQUFFLGVBQWU7Z0NBQ3hCLFVBQVUsRUFBRSxhQUFhOzZCQUMxQjt5QkFDRixDQUFDO3dCQUNGLFlBQVk7d0JBQ1osZUFBZTt3QkFDZixhQUFhO3dCQUNiLGdCQUFnQjtxQkFDakI7b0JBQ0QsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLG9CQUFvQixDQUFDO2lCQUNqRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbi8vIGltcG9ydCB7IEJyZWFkQ3J1bWJzU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvYnJlYWQtY3J1bWJzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBCcmVhZENydW1ic0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50L2JyZWFkLWNydW1icy5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBUcmFuc2xhdGVMb2FkZXIsIFRyYW5zbGF0ZU1vZHVsZSB9IGZyb20gJ0BuZ3gtdHJhbnNsYXRlL2NvcmUnO1xyXG5pbXBvcnQgeyBSb3V0ZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5pbXBvcnQgeyBGbGV4TGF5b3V0TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvZmxleC1sYXlvdXQnO1xyXG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IE1hdEJ1dHRvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2J1dHRvbic7XHJcbmltcG9ydCB7IE1hdEljb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pY29uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBMb2FkZXIgaW1wbGVtZW50cyBUcmFuc2xhdGVMb2FkZXIge1xyXG4gIHByaXZhdGUgdHJhbnNsYXRpb25zID0gbmV3IFN1YmplY3QoKTtcclxuICAkdHJhbnNsYXRpb25zID0gdGhpcy50cmFuc2xhdGlvbnMuYXNPYnNlcnZhYmxlKCk7XHJcbiAgZ2V0VHJhbnNsYXRpb24obGFuZzogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gdGhpcy4kdHJhbnNsYXRpb25zO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIExvYWRlckZhY3RvcnkoKSB7XHJcbiAgcmV0dXJuIG5ldyBMb2FkZXIoKTtcclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuICBkZWNsYXJhdGlvbnM6IFtCcmVhZENydW1ic0NvbXBvbmVudF0sXHJcbiAgaW1wb3J0czogW1xyXG4gICAgQ29tbW9uTW9kdWxlLFxyXG4gICAgVHJhbnNsYXRlTW9kdWxlLmZvckNoaWxkKHtcclxuICAgICAgbG9hZGVyOiB7XHJcbiAgICAgICAgcHJvdmlkZTogVHJhbnNsYXRlTG9hZGVyLFxyXG4gICAgICAgIHVzZUZhY3Rvcnk6IExvYWRlckZhY3RvcnksXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIFJvdXRlck1vZHVsZSxcclxuICAgIE1hdEJ1dHRvbk1vZHVsZSxcclxuICAgIE1hdEljb25Nb2R1bGUsXHJcbiAgICBGbGV4TGF5b3V0TW9kdWxlLFxyXG4gIF0sXHJcbiAgZXhwb3J0czogW1RyYW5zbGF0ZU1vZHVsZSwgQnJlYWRDcnVtYnNDb21wb25lbnRdLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQnJlYWRDcnVtYnNNb2R1bGUge31cclxuIl19