import * as i0 from '@angular/core';
import { Injectable, Component, Input, NgModule } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import * as i2 from '@angular/router';
import { NavigationEnd, RouterModule } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import * as i2$1 from '@ngx-translate/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import * as i3 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i4 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import * as i5 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import * as i6 from '@angular/flex-layout/extended';
import { FlexLayoutModule } from '@angular/flex-layout';

class BreadCrumbsService {
    constructor(router, translate) {
        this.router = router;
        this.translate = translate;
        // Subject emitting the breadcrumb hierarchy
        this.breadcrumbsSubject$ = new BehaviorSubject([]);
        this.breadcrumbs$ = this.breadcrumbsSubject$.asObservable();
        this.router.events
            .pipe(
        // Filter the NavigationEnd events as the breadcrumb is updated only when the route reaches its end
        filter((event) => event instanceof NavigationEnd))
            .subscribe((event) => {
            // Construct the breadcrumb hierarchy
            const root = this.router.routerState.snapshot.root;
            const breadcrumbs = [];
            this.addBreadcrumb(root, [], breadcrumbs);
            // Emit the new hierarchy
            this.breadcrumbsSubject$.next(breadcrumbs);
        });
    }
    addBreadcrumb(route, parentUrl, breadcrumbs) {
        if (route) {
            // Construct the route URL
            const routeUrl = parentUrl.concat(route.url.map((url) => url.path));
            let routeBreadcrumbs = [];
            if (route.data['breadcrumb'] && route.data['breadcrumb'].id) {
                routeBreadcrumbs = [route.data['breadcrumb']];
            }
            else if (route.data['breadcrumb'] &&
                Array.isArray(route.data['breadcrumb'])) {
                routeBreadcrumbs = route.data['breadcrumb'];
            }
            routeBreadcrumbs.forEach((routeBreadcrumb) => {
                // Add an element for the current route part
                if (routeBreadcrumb &&
                    routeBreadcrumb.id &&
                    !breadcrumbs.find((breadcrumb) => breadcrumb.id === routeBreadcrumb.id)) {
                    let url = routeUrl.join('/');
                    if (routeBreadcrumb.numberOfPathsToRemoveFromTheUrl) {
                        url = routeUrl
                            .slice(0, routeUrl.length -
                            routeBreadcrumb.numberOfPathsToRemoveFromTheUrl)
                            .join('/');
                    }
                    const breadcrumb = {
                        id: routeBreadcrumb.id,
                        url: '/' + url,
                    };
                    if (routeBreadcrumb.label) {
                        breadcrumb.label = this.getLabel(route.data, routeBreadcrumb);
                    }
                    if (routeBreadcrumb.iconName) {
                        breadcrumb.iconName = routeBreadcrumb.iconName;
                        breadcrumb.iconFontSet = routeBreadcrumb.iconFontSet
                            ? routeBreadcrumb.iconFontSet
                            : '';
                        breadcrumb.iconPosition = routeBreadcrumb.iconPosition
                            ? routeBreadcrumb.iconPosition
                            : 'start';
                    }
                    breadcrumbs.push(breadcrumb);
                }
            });
            // Add another element for the next route part
            this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
        }
    }
    getLabel(data, routeBreadcrumb) {
        // The breadcrumb can be defined as a static string or as a function to construct the breadcrumb element out of the route data
        data = Object.assign(Object.assign({}, data), { breadcrumb: routeBreadcrumb });
        return typeof data['breadcrumb'].label === 'function'
            ? data['breadcrumb'].label(data)
            : data['breadcrumb'].label
                ? this.translate.instant(data['breadcrumb'].label)
                : '';
    }
}
BreadCrumbsService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsService, deps: [{ token: i2.Router }, { token: i2$1.TranslateService }], target: i0.ɵɵFactoryTarget.Injectable });
BreadCrumbsService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i2.Router }, { type: i2$1.TranslateService }]; } });

class BreadCrumbsComponent {
    constructor(breadcrumbService, router) {
        this.breadcrumbService = breadcrumbService;
        this.router = router;
        this.customClasses = [];
        this.showBackButton = () => { var _a; return ((_a = this.backButtonConfig) === null || _a === void 0 ? void 0 : _a.hidden) ? false : true; };
        this.getBackButtonColor = () => { var _a, _b; return ((_a = this.backButtonConfig) === null || _a === void 0 ? void 0 : _a.color) ? (_b = this.backButtonConfig) === null || _b === void 0 ? void 0 : _b.color : 'primary'; };
        this.getBackButtonClass = () => { var _a, _b; return ((_a = this.backButtonConfig) === null || _a === void 0 ? void 0 : _a.class) ? (_b = this.backButtonConfig) === null || _b === void 0 ? void 0 : _b.class : ''; };
        this.getBackButtonIconName = () => {
            var _a, _b;
            return ((_a = this.backButtonConfig) === null || _a === void 0 ? void 0 : _a.iconName)
                ? (_b = this.backButtonConfig) === null || _b === void 0 ? void 0 : _b.iconName
                : 'keyboard_arrow_left';
        };
        this.getBackButtonIconFontset = () => {
            var _a, _b;
            return ((_a = this.backButtonConfig) === null || _a === void 0 ? void 0 : _a.iconFontSet)
                ? (_b = this.backButtonConfig) === null || _b === void 0 ? void 0 : _b.iconFontSet
                : '';
        };
        this.getBreadcrumbFontSet = (breadcrumb) => (breadcrumb === null || breadcrumb === void 0 ? void 0 : breadcrumb.iconFontSet) ? breadcrumb.iconFontSet : '';
        this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$.pipe(tap((data) => {
            if (data.length >= 2) {
                this.backUrl = data[data.length - 2].url;
            }
        }));
    }
    goBack() {
        this.router.navigateByUrl(this.backUrl);
    }
}
BreadCrumbsComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsComponent, deps: [{ token: BreadCrumbsService }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Component });
BreadCrumbsComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.3", type: BreadCrumbsComponent, selector: "jenga-bread-crumbs", inputs: { customClasses: "customClasses", backButtonConfig: "backButtonConfig" }, ngImport: i0, template: "<div\r\n  class=\"breadcrumbs breadcrumbs-default-style\"\r\n  [ngClass]=\"customClasses\"\r\n  *ngIf=\"(breadcrumbs$ | async)?.length\"\r\n>\r\n  <button\r\n    mat-flat-button\r\n    *ngIf=\"showBackButton()\"\r\n    [color]=\"getBackButtonColor()\"\r\n    [class]=\"\r\n      'breadcrumbs__back-button mat-square-icon square-28 ' +\r\n      getBackButtonClass()\r\n    \"\r\n    (click)=\"goBack()\"\r\n  >\r\n    <mat-icon [fontSet]=\"getBackButtonIconFontset()\">{{\r\n      getBackButtonIconName()\r\n    }}</mat-icon>\r\n  </button>\r\n  <ul>\r\n    <li\r\n      *ngFor=\"let breadcrumb of breadcrumbs$ | async\"\r\n      [routerLink]=\"breadcrumb.url\"\r\n    >\r\n      <mat-icon\r\n        *ngIf=\"breadcrumb.iconName && breadcrumb.iconPosition === 'start'\"\r\n        [fontSet]=\"getBreadcrumbFontSet(breadcrumb)\"\r\n        >{{ breadcrumb.iconName }}</mat-icon\r\n      >\r\n      <span *ngIf=\"breadcrumb.label\">\r\n        {{ breadcrumb.label }}\r\n      </span>\r\n      <mat-icon\r\n        *ngIf=\"breadcrumb.iconName && breadcrumb.iconPosition === 'end'\"\r\n        [fontSet]=\"getBreadcrumbFontSet(breadcrumb)\"\r\n        >{{ breadcrumb.iconName }}</mat-icon\r\n      >\r\n    </li>\r\n  </ul>\r\n</div>\r\n", styles: [".breadcrumbs{display:flex;justify-content:flex-start;align-items:center}.breadcrumbs__back-button{margin-right:15px}.breadcrumbs ul{list-style:none;margin:0;padding:0}.breadcrumbs ul li{display:inline;cursor:pointer}.breadcrumbs button.mat-square-icon{border-radius:5px;padding:0;min-width:36px;line-height:36px}.breadcrumbs button.mat-square-icon.square-28{min-width:28px;line-height:28px}.breadcrumbs.breadcrumbs-default-style ul{padding:20px 0}.breadcrumbs.breadcrumbs-default-style ul li:before{content:\"/\";margin:0 3px;cursor:auto}.breadcrumbs.breadcrumbs-default-style ul li:first-child:before{content:\"\";margin:0}.breadcrumbs.breadcrumbs-default-style ul li:last-child{font-weight:700}.breadcrumbs.breadcrumbs-default-style ul li:last-child:before{font-weight:200}\n"], dependencies: [{ kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i3.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.RouterLink, selector: ":not(a):not(area)[routerLink]", inputs: ["queryParams", "fragment", "queryParamsHandling", "state", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }, { kind: "component", type: i4.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { kind: "component", type: i5.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: i6.DefaultClassDirective, selector: "  [ngClass], [ngClass.xs], [ngClass.sm], [ngClass.md], [ngClass.lg], [ngClass.xl],  [ngClass.lt-sm], [ngClass.lt-md], [ngClass.lt-lg], [ngClass.lt-xl],  [ngClass.gt-xs], [ngClass.gt-sm], [ngClass.gt-md], [ngClass.gt-lg]", inputs: ["ngClass", "ngClass.xs", "ngClass.sm", "ngClass.md", "ngClass.lg", "ngClass.xl", "ngClass.lt-sm", "ngClass.lt-md", "ngClass.lt-lg", "ngClass.lt-xl", "ngClass.gt-xs", "ngClass.gt-sm", "ngClass.gt-md", "ngClass.gt-lg"] }, { kind: "pipe", type: i3.AsyncPipe, name: "async" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'jenga-bread-crumbs', template: "<div\r\n  class=\"breadcrumbs breadcrumbs-default-style\"\r\n  [ngClass]=\"customClasses\"\r\n  *ngIf=\"(breadcrumbs$ | async)?.length\"\r\n>\r\n  <button\r\n    mat-flat-button\r\n    *ngIf=\"showBackButton()\"\r\n    [color]=\"getBackButtonColor()\"\r\n    [class]=\"\r\n      'breadcrumbs__back-button mat-square-icon square-28 ' +\r\n      getBackButtonClass()\r\n    \"\r\n    (click)=\"goBack()\"\r\n  >\r\n    <mat-icon [fontSet]=\"getBackButtonIconFontset()\">{{\r\n      getBackButtonIconName()\r\n    }}</mat-icon>\r\n  </button>\r\n  <ul>\r\n    <li\r\n      *ngFor=\"let breadcrumb of breadcrumbs$ | async\"\r\n      [routerLink]=\"breadcrumb.url\"\r\n    >\r\n      <mat-icon\r\n        *ngIf=\"breadcrumb.iconName && breadcrumb.iconPosition === 'start'\"\r\n        [fontSet]=\"getBreadcrumbFontSet(breadcrumb)\"\r\n        >{{ breadcrumb.iconName }}</mat-icon\r\n      >\r\n      <span *ngIf=\"breadcrumb.label\">\r\n        {{ breadcrumb.label }}\r\n      </span>\r\n      <mat-icon\r\n        *ngIf=\"breadcrumb.iconName && breadcrumb.iconPosition === 'end'\"\r\n        [fontSet]=\"getBreadcrumbFontSet(breadcrumb)\"\r\n        >{{ breadcrumb.iconName }}</mat-icon\r\n      >\r\n    </li>\r\n  </ul>\r\n</div>\r\n", styles: [".breadcrumbs{display:flex;justify-content:flex-start;align-items:center}.breadcrumbs__back-button{margin-right:15px}.breadcrumbs ul{list-style:none;margin:0;padding:0}.breadcrumbs ul li{display:inline;cursor:pointer}.breadcrumbs button.mat-square-icon{border-radius:5px;padding:0;min-width:36px;line-height:36px}.breadcrumbs button.mat-square-icon.square-28{min-width:28px;line-height:28px}.breadcrumbs.breadcrumbs-default-style ul{padding:20px 0}.breadcrumbs.breadcrumbs-default-style ul li:before{content:\"/\";margin:0 3px;cursor:auto}.breadcrumbs.breadcrumbs-default-style ul li:first-child:before{content:\"\";margin:0}.breadcrumbs.breadcrumbs-default-style ul li:last-child{font-weight:700}.breadcrumbs.breadcrumbs-default-style ul li:last-child:before{font-weight:200}\n"] }]
        }], ctorParameters: function () { return [{ type: BreadCrumbsService }, { type: i2.Router }]; }, propDecorators: { customClasses: [{
                type: Input
            }], backButtonConfig: [{
                type: Input
            }] } });

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
class BreadCrumbsModule {
}
BreadCrumbsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
BreadCrumbsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsModule, declarations: [BreadCrumbsComponent], imports: [CommonModule, i2$1.TranslateModule, RouterModule,
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

/*
 * Public API Surface of bread-crumbs
 */

/**
 * Generated bundle index. Do not edit.
 */

export { BreadCrumbsComponent, BreadCrumbsModule, BreadCrumbsService };
//# sourceMappingURL=frontend-bread-crumbs.mjs.map
