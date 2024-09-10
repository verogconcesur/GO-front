import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BreadcrumbBackButtonConfigI } from '../interfaces/bread-crumbs-back-button-config.interface';
import { Breadcrumb } from '../models/bread-crumbs.model';
import { BreadCrumbsService } from '../services/bread-crumbs.service';
import * as i0 from "@angular/core";
export declare class BreadCrumbsComponent {
    private readonly breadcrumbService;
    private router;
    customClasses: string[];
    backButtonConfig: BreadcrumbBackButtonConfigI;
    breadcrumbs$: Observable<Breadcrumb[]>;
    private backUrl;
    constructor(breadcrumbService: BreadCrumbsService, router: Router);
    goBack(): void;
    showBackButton: () => boolean;
    getBackButtonColor: () => string;
    getBackButtonClass: () => string;
    getBackButtonIconName: () => string;
    getBackButtonIconFontset: () => string;
    getBreadcrumbFontSet: (breadcrumb: Breadcrumb) => string;
    static ɵfac: i0.ɵɵFactoryDeclaration<BreadCrumbsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BreadCrumbsComponent, "jenga-bread-crumbs", never, { "customClasses": "customClasses"; "backButtonConfig": "backButtonConfig"; }, {}, never, never, false>;
}
