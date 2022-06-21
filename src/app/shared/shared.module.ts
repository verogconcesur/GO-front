import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MyProfileComponent } from './components/app-user/my-profile/my-profile.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { GoBackComponent } from './components/go-back/go-back.component';
import { ProgressSpinnerDialogComponent } from './components/progress-spinner-dialog/progress-spinner-dialog.component';
import { MaterialModule } from './material.module';
import { CustomDialogModule, CustomDialogService } from '@jenga/custom-dialog';
import { ConfirmDialogService } from './services/confirm-dialog.service';
import { GlobalMessageService } from './services/global-message.service';
import { ProgressSpinnerDialogService } from './services/progress-spinner-dialog.service';
import { FilterDrawerModule } from './modules/filter-drawer/filter-drawer.module';
import { ShowToolbarIfTruncatedDirective } from './directives/showToolbarIfTruncated.directive';
import { BreadCrumbsModule } from '@jenga/bread-crumbs';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionComponent } from '../shared/components/administration-common-header-section/administration-common-header-section.component';

@NgModule({
  declarations: [
    ProgressSpinnerDialogComponent,
    ConfirmDialogComponent,
    GoBackComponent,
    MyProfileComponent,
    ShowToolbarIfTruncatedDirective,
    AdministrationCommonHeaderSectionComponent
  ],
  imports: [
    TranslateModule,
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    CustomDialogModule,
    FilterDrawerModule,
    BreadCrumbsModule
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
    MyProfileComponent,
    FilterDrawerModule,
    ShowToolbarIfTruncatedDirective,
    BreadCrumbsModule,
    CustomDialogModule,
    AdministrationCommonHeaderSectionComponent
  ]
})
export class SharedModule {}
