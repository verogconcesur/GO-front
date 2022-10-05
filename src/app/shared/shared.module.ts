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
import { ResponsiveTabsComponent } from './components/responsive-tabs/responsive-tabs.component';
import { HighlightDirective } from './directives/highLight.directive';

@NgModule({
  declarations: [
    ProgressSpinnerDialogComponent,
    ConfirmDialogComponent,
    GoBackComponent,
    ShowToolbarIfTruncatedDirective,
    RemoveWrapperDirective,
    HighlightDirective,
    ResponsiveTabsComponent
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
    ResponsiveTabsComponent,
    CommonModule,
    ShowToolbarIfTruncatedDirective,
    RemoveWrapperDirective,
    HighlightDirective,
    CustomDialogModule
  ]
})
export class SharedModule {}
