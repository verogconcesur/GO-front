import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomDialogService } from './services/custom-dialog.service';
import { CustomDialogComponent } from './custom-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '@shared/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomDialogHeaderComponent } from './components/custom-dialog-header/custom-dialog-header.component';
import { CustomDialogFooterComponent } from './components/custom-dialog-footer/custom-dialog-footer.component';
// eslint-disable-next-line max-len
import { CustomDialogButtonsWrapperComponent } from './components/custom-dialog-buttons-wrapper/custom-dialog-buttons-wrapper.component';

@NgModule({
  declarations: [
    CustomDialogComponent,
    CustomDialogHeaderComponent,
    CustomDialogFooterComponent,
    CustomDialogButtonsWrapperComponent
  ],
  imports: [CommonModule, TranslateModule, MaterialModule, FlexLayoutModule, ReactiveFormsModule],
  exports: [],
  providers: [CustomDialogService]
})
export class CustomDialogModule {}
