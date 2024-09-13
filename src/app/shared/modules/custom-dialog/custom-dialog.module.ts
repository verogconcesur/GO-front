import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomDialogFooterComponent } from './components/custom-dialog-footer/custom-dialog-footer.component';
import { CustomDialogHeaderComponent } from './components/custom-dialog-header/custom-dialog-header.component';
import { CustomDialogComponent } from './custom-dialog.component';
// eslint-disable-next-line max-len
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { CustomDialogButtonsWrapperComponent } from './components/custom-dialog-buttons-wrapper/custom-dialog-buttons-wrapper.component';

export class Loader implements TranslateLoader {
  private translations = new Subject();
  $translations = this.translations.asObservable();
  getTranslation(lang: string) {
    return this.$translations;
  }
}

export function LoaderFactory() {
  return new Loader();
}

@NgModule({
  declarations: [
    CustomDialogComponent,
    CustomDialogHeaderComponent,
    CustomDialogFooterComponent,
    CustomDialogButtonsWrapperComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  exports: [TranslateModule]
})
export class CustomDialogModule {}
