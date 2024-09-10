import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Breadcrumb } from '../models/bread-crumbs.model';
import { TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
export declare class BreadCrumbsService {
    private router;
    private translate;
    readonly breadcrumbs$: Observable<Breadcrumb[]>;
    private readonly breadcrumbsSubject$;
    constructor(router: Router, translate: TranslateService);
    private addBreadcrumb;
    private getLabel;
    static ɵfac: i0.ɵɵFactoryDeclaration<BreadCrumbsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BreadCrumbsService>;
}
