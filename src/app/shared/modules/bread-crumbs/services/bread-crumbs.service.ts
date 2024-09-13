import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ActivatedRouteSnapshot,
  Data,
  NavigationEnd,
  Router,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../models/bread-crumbs.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class BreadCrumbsService {
  // Observable exposing the breadcrumb hierarchy
  readonly breadcrumbs$: Observable<Breadcrumb[]>;
  // Subject emitting the breadcrumb hierarchy
  private readonly breadcrumbsSubject$ = new BehaviorSubject<Breadcrumb[]>([]);

  constructor(private router: Router, private translate: TranslateService) {
    this.breadcrumbs$ = this.breadcrumbsSubject$.asObservable();
    this.router.events
      .pipe(
        // Filter the NavigationEnd events as the breadcrumb is updated only when the route reaches its end
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event) => {
        // Construct the breadcrumb hierarchy
        const root = this.router.routerState.snapshot.root;
        const breadcrumbs: Breadcrumb[] = [];
        this.addBreadcrumb(root, [], breadcrumbs);
        // Emit the new hierarchy
        this.breadcrumbsSubject$.next(breadcrumbs);
      });
  }

  private addBreadcrumb(
    route: ActivatedRouteSnapshot | null,
    parentUrl: string[],
    breadcrumbs: Breadcrumb[]
  ) {
    if (route) {
      // Construct the route URL
      const routeUrl = parentUrl.concat(route.url.map((url) => url.path));
      let routeBreadcrumbs = [];
      if (route.data['breadcrumb'] && route.data['breadcrumb'].id) {
        routeBreadcrumbs = [route.data['breadcrumb']];
      } else if (
        route.data['breadcrumb'] &&
        Array.isArray(route.data['breadcrumb'])
      ) {
        routeBreadcrumbs = route.data['breadcrumb'];
      }

      routeBreadcrumbs.forEach(
        (routeBreadcrumb: {
          id: string;
          url: string;
          label?: (data: Data) => string | string;
          iconName?: string;
          iconFontSet?: string;
          iconPosition?: 'start' | 'end';
          numberOfPathsToRemoveFromTheUrl?: number;
        }) => {
          // Add an element for the current route part
          if (
            routeBreadcrumb &&
            routeBreadcrumb.id &&
            !breadcrumbs.find(
              (breadcrumb: Breadcrumb) => breadcrumb.id === routeBreadcrumb.id
            )
          ) {
            let url = routeUrl.join('/');
            if (routeBreadcrumb.numberOfPathsToRemoveFromTheUrl) {
              url = routeUrl
                .slice(
                  0,
                  routeUrl.length -
                    routeBreadcrumb.numberOfPathsToRemoveFromTheUrl
                )
                .join('/');
            }
            const breadcrumb: Breadcrumb = {
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
        }
      );

      // Add another element for the next route part
      this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
    }
  }

  private getLabel(
    data: Data,
    routeBreadcrumb: {
      id: string;
      url: string;
      label?: (data: Data) => string | string;
      iconName?: string;
      iconFontSet?: string;
      iconPosition?: 'start' | 'end';
      numberOfPathsToRemoveFromTheUrl?: number;
    }
  ) {
    // The breadcrumb can be defined as a static string or as a function to construct the breadcrumb element out of the route data
    data = { ...data, breadcrumb: routeBreadcrumb };
    return typeof data['breadcrumb'].label === 'function'
      ? data['breadcrumb'].label(data)
      : data['breadcrumb'].label
      ? this.translate.instant(data['breadcrumb'].label)
      : '';
  }
}
