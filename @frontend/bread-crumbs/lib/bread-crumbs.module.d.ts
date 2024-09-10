import { TranslateLoader } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "./component/bread-crumbs.component";
import * as i2 from "@angular/common";
import * as i3 from "@ngx-translate/core";
import * as i4 from "@angular/router";
import * as i5 from "@angular/material/button";
import * as i6 from "@angular/material/icon";
import * as i7 from "@angular/flex-layout";
export declare class Loader implements TranslateLoader {
    private translations;
    $translations: import("rxjs").Observable<unknown>;
    getTranslation(lang: string): import("rxjs").Observable<unknown>;
}
export declare function LoaderFactory(): Loader;
export declare class BreadCrumbsModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BreadCrumbsModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BreadCrumbsModule, [typeof i1.BreadCrumbsComponent], [typeof i2.CommonModule, typeof i3.TranslateModule, typeof i4.RouterModule, typeof i5.MatButtonModule, typeof i6.MatIconModule, typeof i7.FlexLayoutModule], [typeof i3.TranslateModule, typeof i1.BreadCrumbsComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BreadCrumbsModule>;
}
