import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { GoBackComponent } from './components/go-back/go-back.component';
import { ProgressSpinnerDialogComponent } from './components/progress-spinner-dialog/progress-spinner-dialog.component';
import { MaterialModule } from './material.module';
import { CustomDialogModule, CustomDialogService } from '@jenga/custom-dialog';
import { ConfirmDialogService } from './services/confirm-dialog.service';
import { GlobalMessageService } from './services/global-message.service';
import { ProgressSpinnerDialogService } from './services/progress-spinner-dialog.service';
import { ShowToolbarIfTruncatedDirective } from './directives/showToolbarIfTruncated.directive';
import { RemoveWrapperDirective } from './directives/removeWrapper.directive';

@NgModule({
  declarations: [
    ProgressSpinnerDialogComponent,
    ConfirmDialogComponent,
    GoBackComponent,
    ShowToolbarIfTruncatedDirective,
    RemoveWrapperDirective
  ],
  imports: [
    TranslateModule,
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    CustomDialogModule
  ],
  providers: [GlobalMessageService, ConfirmDialogService, ProgressSpinnerDialogService, CustomDialogService],
  exports: [
    TranslateModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    GoBackComponent,
    CommonModule,
    ShowToolbarIfTruncatedDirective,
    RemoveWrapperDirective,
    CustomDialogModule
  ]
})
export class SharedModule {}
