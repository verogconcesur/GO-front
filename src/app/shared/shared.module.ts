import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { CustomMatFormFieldComponent } from './components/custom-mat-formfield/custom-mat-formfield.component';
import { GoBackComponent } from './components/go-back/go-back.component';
import { ProgressSpinnerDialogComponent } from './components/progress-spinner-dialog/progress-spinner-dialog.component';
import { ResponsiveTabsComponent } from './components/responsive-tabs/responsive-tabs.component';
import { DropFilesZonetDirective } from './directives/dropFilesZone.directive';
import { HighlightDirective } from './directives/highLight.directive';
import { MatAutocompleteOptionsScrollDirective } from './directives/matAutocompleteInfiniteScroll.directive';
import { RemoveWrapperDirective } from './directives/removeWrapper.directive';
import { ShowToolbarIfTruncatedDirective } from './directives/showToolbarIfTruncated.directive';
import { ZoomDirective } from './directives/zoomImage.directive';
import { MaterialModule } from './material.module';
import { CustomDialogModule } from './modules/custom-dialog/custom-dialog.module';
import { CustomDialogService } from './modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from './services/confirm-dialog.service';
import { GlobalMessageService } from './services/global-message.service';
import { ProgressSpinnerDialogService } from './services/progress-spinner-dialog.service';
import { SortService } from './services/sort.service';
import { CardTabItemTypePipePipe } from './utils/card-tab-item-type-pipe.pipe';
import { SafeHtmlPipe } from './utils/safe-inner-html.pipe';
import { TwoDigitDecimalDirective } from './utils/two-digit-decimal.directive';

@NgModule({
  declarations: [
    ProgressSpinnerDialogComponent,
    ConfirmDialogComponent,
    GoBackComponent,
    ShowToolbarIfTruncatedDirective,
    RemoveWrapperDirective,
    HighlightDirective,
    MatAutocompleteOptionsScrollDirective,
    DropFilesZonetDirective,
    ResponsiveTabsComponent,
    TwoDigitDecimalDirective,
    ZoomDirective,
    CardTabItemTypePipePipe,
    SafeHtmlPipe,
    CustomMatFormFieldComponent
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
  providers: [GlobalMessageService, ConfirmDialogService, ProgressSpinnerDialogService, CustomDialogService, SortService],
  exports: [
    TranslateModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ZoomDirective,
    FormsModule,
    GoBackComponent,
    ResponsiveTabsComponent,
    CommonModule,
    ShowToolbarIfTruncatedDirective,
    RemoveWrapperDirective,
    HighlightDirective,
    MatAutocompleteOptionsScrollDirective,
    DropFilesZonetDirective,
    CustomDialogModule,
    TwoDigitDecimalDirective,
    CardTabItemTypePipePipe,
    SafeHtmlPipe,
    CustomMatFormFieldComponent
  ]
})
export class SharedModule {}
