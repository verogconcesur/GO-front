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
import { CustomDialogModule } from './modules/custom-dialog/custom-dialog.module';
import { ConfirmDialogService } from './services/confirm-dialog.service';
import { GlobalMessageService } from './services/global-message.service';
import { ProgressSpinnerDialogService } from './services/progress-spinner-dialog.service';

@NgModule({
  declarations: [ProgressSpinnerDialogComponent, ConfirmDialogComponent, GoBackComponent, MyProfileComponent],
  imports: [
    TranslateModule,
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    CustomDialogModule,
    FormsModule
  ],
  providers: [GlobalMessageService, ConfirmDialogService, ProgressSpinnerDialogService],
  exports: [
    TranslateModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    GoBackComponent,
    CommonModule,
    MyProfileComponent,
    FormsModule
  ]
})
export class SharedModule {}
