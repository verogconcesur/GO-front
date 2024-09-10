import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavigationEnd, } from '@angular/router';
import { filter } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
import * as i2 from "@ngx-translate/core";
export class BreadCrumbsService {
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
        data = { ...data, breadcrumb: routeBreadcrumb };
        return typeof data['breadcrumb'].label === 'function'
            ? data['breadcrumb'].label(data)
            : data['breadcrumb'].label
                ? this.translate.instant(data['breadcrumb'].label)
                : '';
    }
}
BreadCrumbsService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsService, deps: [{ token: i1.Router }, { token: i2.TranslateService }], target: i0.ɵɵFactoryTarget.Injectable });
BreadCrumbsService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.3", ngImport: i0, type: BreadCrumbsService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i1.Router }, { type: i2.TranslateService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWQtY3J1bWJzLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9icmVhZC1jcnVtYnMvc3JjL2xpYi9zZXJ2aWNlcy9icmVhZC1jcnVtYnMuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxlQUFlLEVBQWMsTUFBTSxNQUFNLENBQUM7QUFDbkQsT0FBTyxFQUdMLGFBQWEsR0FFZCxNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7OztBQU94QyxNQUFNLE9BQU8sa0JBQWtCO0lBTTdCLFlBQW9CLE1BQWMsRUFBVSxTQUEyQjtRQUFuRCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFIdkUsNENBQTRDO1FBQzNCLHdCQUFtQixHQUFHLElBQUksZUFBZSxDQUFlLEVBQUUsQ0FBQyxDQUFDO1FBRzNFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTthQUNmLElBQUk7UUFDSCxtR0FBbUc7UUFDbkcsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLFlBQVksYUFBYSxDQUFDLENBQ2xEO2FBQ0EsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbkIscUNBQXFDO1lBQ3JDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDbkQsTUFBTSxXQUFXLEdBQWlCLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxDQUFD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SDtRQUM5SCxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLENBQUM7UUFDaEQsT0FBTyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLEtBQUssVUFBVTtZQUNuRCxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDaEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLO2dCQUMxQixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDbEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNULENBQUM7OytHQWxIVSxrQkFBa0I7bUhBQWxCLGtCQUFrQixjQUZqQixNQUFNOzJGQUVQLGtCQUFrQjtrQkFIOUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge1xyXG4gIEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXHJcbiAgRGF0YSxcclxuICBOYXZpZ2F0aW9uRW5kLFxyXG4gIFJvdXRlcixcclxufSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5pbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEJyZWFkY3J1bWIgfSBmcm9tICcuLi9tb2RlbHMvYnJlYWQtY3J1bWJzLm1vZGVsJztcclxuaW1wb3J0IHsgVHJhbnNsYXRlU2VydmljZSB9IGZyb20gJ0BuZ3gtdHJhbnNsYXRlL2NvcmUnO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46ICdyb290JyxcclxufSlcclxuZXhwb3J0IGNsYXNzIEJyZWFkQ3J1bWJzU2VydmljZSB7XHJcbiAgLy8gT2JzZXJ2YWJsZSBleHBvc2luZyB0aGUgYnJlYWRjcnVtYiBoaWVyYXJjaHlcclxuICByZWFkb25seSBicmVhZGNydW1icyQ6IE9ic2VydmFibGU8QnJlYWRjcnVtYltdPjtcclxuICAvLyBTdWJqZWN0IGVtaXR0aW5nIHRoZSBicmVhZGNydW1iIGhpZXJhcmNoeVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYnJlYWRjcnVtYnNTdWJqZWN0JCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8QnJlYWRjcnVtYltdPihbXSk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsIHByaXZhdGUgdHJhbnNsYXRlOiBUcmFuc2xhdGVTZXJ2aWNlKSB7XHJcbiAgICB0aGlzLmJyZWFkY3J1bWJzJCA9IHRoaXMuYnJlYWRjcnVtYnNTdWJqZWN0JC5hc09ic2VydmFibGUoKTtcclxuICAgIHRoaXMucm91dGVyLmV2ZW50c1xyXG4gICAgICAucGlwZShcclxuICAgICAgICAvLyBGaWx0ZXIgdGhlIE5hdmlnYXRpb25FbmQgZXZlbnRzIGFzIHRoZSBicmVhZGNydW1iIGlzIHVwZGF0ZWQgb25seSB3aGVuIHRoZSByb3V0ZSByZWFjaGVzIGl0cyBlbmRcclxuICAgICAgICBmaWx0ZXIoKGV2ZW50KSA9PiBldmVudCBpbnN0YW5jZW9mIE5hdmlnYXRpb25FbmQpXHJcbiAgICAgIClcclxuICAgICAgLnN1YnNjcmliZSgoZXZlbnQpID0+IHtcclxuICAgICAgICAvLyBDb25zdHJ1Y3QgdGhlIGJyZWFkY3J1bWIgaGllcmFyY2h5XHJcbiAgICAgICAgY29uc3Qgcm9vdCA9IHRoaXMucm91dGVyLnJvdXRlclN0YXRlLnNuYXBzaG90LnJvb3Q7XHJcbiAgICAgICAgY29uc3QgYnJlYWRjcnVtYnM6IEJyZWFkY3J1bWJbXSA9IFtdO1xyXG4gICAgICAgIHRoaXMuYWRkQnJlYWRjcnVtYihyb290LCBbXSwgYnJlYWRjcnVtYnMpO1xyXG4gICAgICAgIC8vIEVtaXQgdGhlIG5ldyBoaWVyYXJjaHlcclxuICAgICAgICB0aGlzLmJyZWFkY3J1bWJzU3ViamVjdCQubmV4dChicmVhZGNydW1icyk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRCcmVhZGNydW1iKFxyXG4gICAgcm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QgfCBudWxsLFxyXG4gICAgcGFyZW50VXJsOiBzdHJpbmdbXSxcclxuICAgIGJyZWFkY3J1bWJzOiBCcmVhZGNydW1iW11cclxuICApIHtcclxuICAgIGlmIChyb3V0ZSkge1xyXG4gICAgICAvLyBDb25zdHJ1Y3QgdGhlIHJvdXRlIFVSTFxyXG4gICAgICBjb25zdCByb3V0ZVVybCA9IHBhcmVudFVybC5jb25jYXQocm91dGUudXJsLm1hcCgodXJsKSA9PiB1cmwucGF0aCkpO1xyXG4gICAgICBsZXQgcm91dGVCcmVhZGNydW1icyA9IFtdO1xyXG4gICAgICBpZiAocm91dGUuZGF0YVsnYnJlYWRjcnVtYiddICYmIHJvdXRlLmRhdGFbJ2JyZWFkY3J1bWInXS5pZCkge1xyXG4gICAgICAgIHJvdXRlQnJlYWRjcnVtYnMgPSBbcm91dGUuZGF0YVsnYnJlYWRjcnVtYiddXTtcclxuICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICByb3V0ZS5kYXRhWydicmVhZGNydW1iJ10gJiZcclxuICAgICAgICBBcnJheS5pc0FycmF5KHJvdXRlLmRhdGFbJ2JyZWFkY3J1bWInXSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgcm91dGVCcmVhZGNydW1icyA9IHJvdXRlLmRhdGFbJ2JyZWFkY3J1bWInXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcm91dGVCcmVhZGNydW1icy5mb3JFYWNoKFxyXG4gICAgICAgIChyb3V0ZUJyZWFkY3J1bWI6IHtcclxuICAgICAgICAgIGlkOiBzdHJpbmc7XHJcbiAgICAgICAgICB1cmw6IHN0cmluZztcclxuICAgICAgICAgIGxhYmVsPzogKGRhdGE6IERhdGEpID0+IHN0cmluZyB8IHN0cmluZztcclxuICAgICAgICAgIGljb25OYW1lPzogc3RyaW5nO1xyXG4gICAgICAgICAgaWNvbkZvbnRTZXQ/OiBzdHJpbmc7XHJcbiAgICAgICAgICBpY29uUG9zaXRpb24/OiAnc3RhcnQnIHwgJ2VuZCc7XHJcbiAgICAgICAgICBudW1iZXJPZlBhdGhzVG9SZW1vdmVGcm9tVGhlVXJsPzogbnVtYmVyO1xyXG4gICAgICAgIH0pID0+IHtcclxuICAgICAgICAgIC8vIEFkZCBhbiBlbGVtZW50IGZvciB0aGUgY3VycmVudCByb3V0ZSBwYXJ0XHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIHJvdXRlQnJlYWRjcnVtYiAmJlxyXG4gICAgICAgICAgICByb3V0ZUJyZWFkY3J1bWIuaWQgJiZcclxuICAgICAgICAgICAgIWJyZWFkY3J1bWJzLmZpbmQoXHJcbiAgICAgICAgICAgICAgKGJyZWFkY3J1bWI6IEJyZWFkY3J1bWIpID0+IGJyZWFkY3J1bWIuaWQgPT09IHJvdXRlQnJlYWRjcnVtYi5pZFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgbGV0IHVybCA9IHJvdXRlVXJsLmpvaW4oJy8nKTtcclxuICAgICAgICAgICAgaWYgKHJvdXRlQnJlYWRjcnVtYi5udW1iZXJPZlBhdGhzVG9SZW1vdmVGcm9tVGhlVXJsKSB7XHJcbiAgICAgICAgICAgICAgdXJsID0gcm91dGVVcmxcclxuICAgICAgICAgICAgICAgIC5zbGljZShcclxuICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgICAgcm91dGVVcmwubGVuZ3RoIC1cclxuICAgICAgICAgICAgICAgICAgICByb3V0ZUJyZWFkY3J1bWIubnVtYmVyT2ZQYXRoc1RvUmVtb3ZlRnJvbVRoZVVybFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgLmpvaW4oJy8nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBicmVhZGNydW1iOiBCcmVhZGNydW1iID0ge1xyXG4gICAgICAgICAgICAgIGlkOiByb3V0ZUJyZWFkY3J1bWIuaWQsXHJcbiAgICAgICAgICAgICAgdXJsOiAnLycgKyB1cmwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChyb3V0ZUJyZWFkY3J1bWIubGFiZWwpIHtcclxuICAgICAgICAgICAgICBicmVhZGNydW1iLmxhYmVsID0gdGhpcy5nZXRMYWJlbChyb3V0ZS5kYXRhLCByb3V0ZUJyZWFkY3J1bWIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyb3V0ZUJyZWFkY3J1bWIuaWNvbk5hbWUpIHtcclxuICAgICAgICAgICAgICBicmVhZGNydW1iLmljb25OYW1lID0gcm91dGVCcmVhZGNydW1iLmljb25OYW1lO1xyXG4gICAgICAgICAgICAgIGJyZWFkY3J1bWIuaWNvbkZvbnRTZXQgPSByb3V0ZUJyZWFkY3J1bWIuaWNvbkZvbnRTZXRcclxuICAgICAgICAgICAgICAgID8gcm91dGVCcmVhZGNydW1iLmljb25Gb250U2V0XHJcbiAgICAgICAgICAgICAgICA6ICcnO1xyXG4gICAgICAgICAgICAgIGJyZWFkY3J1bWIuaWNvblBvc2l0aW9uID0gcm91dGVCcmVhZGNydW1iLmljb25Qb3NpdGlvblxyXG4gICAgICAgICAgICAgICAgPyByb3V0ZUJyZWFkY3J1bWIuaWNvblBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICA6ICdzdGFydCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWRjcnVtYnMucHVzaChicmVhZGNydW1iKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBBZGQgYW5vdGhlciBlbGVtZW50IGZvciB0aGUgbmV4dCByb3V0ZSBwYXJ0XHJcbiAgICAgIHRoaXMuYWRkQnJlYWRjcnVtYihyb3V0ZS5maXJzdENoaWxkLCByb3V0ZVVybCwgYnJlYWRjcnVtYnMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRMYWJlbChcclxuICAgIGRhdGE6IERhdGEsXHJcbiAgICByb3V0ZUJyZWFkY3J1bWI6IHtcclxuICAgICAgaWQ6IHN0cmluZztcclxuICAgICAgdXJsOiBzdHJpbmc7XHJcbiAgICAgIGxhYmVsPzogKGRhdGE6IERhdGEpID0+IHN0cmluZyB8IHN0cmluZztcclxuICAgICAgaWNvbk5hbWU/OiBzdHJpbmc7XHJcbiAgICAgIGljb25Gb250U2V0Pzogc3RyaW5nO1xyXG4gICAgICBpY29uUG9zaXRpb24/OiAnc3RhcnQnIHwgJ2VuZCc7XHJcbiAgICAgIG51bWJlck9mUGF0aHNUb1JlbW92ZUZyb21UaGVVcmw/OiBudW1iZXI7XHJcbiAgICB9XHJcbiAgKSB7XHJcbiAgICAvLyBUaGUgYnJlYWRjcnVtYiBjYW4gYmUgZGVmaW5lZCBhcyBhIHN0YXRpYyBzdHJpbmcgb3IgYXMgYSBmdW5jdGlvbiB0byBjb25zdHJ1Y3QgdGhlIGJyZWFkY3J1bWIgZWxlbWVudCBvdXQgb2YgdGhlIHJvdXRlIGRhdGFcclxuICAgIGRhdGEgPSB7IC4uLmRhdGEsIGJyZWFkY3J1bWI6IHJvdXRlQnJlYWRjcnVtYiB9O1xyXG4gICAgcmV0dXJuIHR5cGVvZiBkYXRhWydicmVhZGNydW1iJ10ubGFiZWwgPT09ICdmdW5jdGlvbidcclxuICAgICAgPyBkYXRhWydicmVhZGNydW1iJ10ubGFiZWwoZGF0YSlcclxuICAgICAgOiBkYXRhWydicmVhZGNydW1iJ10ubGFiZWxcclxuICAgICAgPyB0aGlzLnRyYW5zbGF0ZS5pbnN0YW50KGRhdGFbJ2JyZWFkY3J1bWInXS5sYWJlbClcclxuICAgICAgOiAnJztcclxuICB9XHJcbn1cclxuIl19