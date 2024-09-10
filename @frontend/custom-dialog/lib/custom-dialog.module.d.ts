import { TranslateLoader } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "./custom-dialog.component";
import * as i2 from "./components/custom-dialog-header/custom-dialog-header.component";
import * as i3 from "./components/custom-dialog-footer/custom-dialog-footer.component";
import * as i4 from "./components/custom-dialog-buttons-wrapper/custom-dialog-buttons-wrapper.component";
import * as i5 from "@angular/common";
import * as i6 from "@ngx-translate/core";
import * as i7 from "@angular/material/button";
import * as i8 from "@angular/material/divider";
import * as i9 from "@angular/material/dialog";
import * as i10 from "@angular/material/icon";
import * as i11 from "@angular/flex-layout";
import * as i12 from "@angular/forms";
export declare class Loader implements TranslateLoader {
    private translations;
    $translations: import("rxjs").Observable<unknown>;
    getTranslation(lang: string): import("rxjs").Observable<unknown>;
}
export declare function LoaderFactory(): Loader;
export declare class CustomDialogModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<CustomDialogModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<CustomDialogModule, [typeof i1.CustomDialogComponent, typeof i2.CustomDialogHeaderComponent, typeof i3.CustomDialogFooterComponent, typeof i4.CustomDialogButtonsWrapperComponent], [typeof i5.CommonModule, typeof i6.TranslateModule, typeof i7.MatButtonModule, typeof i8.MatDividerModule, typeof i9.MatDialogModule, typeof i10.MatIconModule, typeof i11.FlexLayoutModule, typeof i12.ReactiveFormsModule], [typeof i6.TranslateModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<CustomDialogModule>;
}
