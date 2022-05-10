import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ProgressSpinnerDialogComponent } from './components/progress-spinner-dialog/progress-spinner-dialog.component';
import { MaterialModule } from './material.module';
import { ConfirmDialogService } from './services/confirm-dialog.service';
import { GlobalMessageService } from './services/global-message.service';
import { ProgressSpinnerDialogService } from './services/progress-spinner-dialog.service';

@NgModule({
  declarations: [ProgressSpinnerDialogComponent, ConfirmDialogComponent],
  imports: [
    TranslateModule,
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  providers: [
    GlobalMessageService,
    ConfirmDialogService,
    ProgressSpinnerDialogService
  ],
  exports: [
    TranslateModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule
  ]
})
export class SharedModule {}
