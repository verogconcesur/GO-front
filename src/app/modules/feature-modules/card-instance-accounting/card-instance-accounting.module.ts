import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { CardInstanceAccountingComponent } from './card-instance-accounting.component';
import { CardAccountingDialogFormComponent } from './card-accounting-dialog-form/card-accounting-dialog-form.component';
import { MediaViewerDialogModule } from '../media-viewer-dialog/media-viewer-dialog.module';

@NgModule({
  declarations: [CardInstanceAccountingComponent, CardAccountingDialogFormComponent],
  imports: [CommonModule, SharedModule, MediaViewerDialogModule],
  exports: [CardInstanceAccountingComponent],
  entryComponents: []
})
export class CardInstanceAccountingModule {}
