import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { CardInstanceAccountingComponent } from './card-instance-accounting.component';
// eslint-disable-next-line max-len
import { CardAccountingLineDialogFormComponent } from './card-accounting-line-dialog-form/card-accounting-line-dialog-form.component';

@NgModule({
  declarations: [CardInstanceAccountingComponent, CardAccountingLineDialogFormComponent],
  imports: [CommonModule, SharedModule],
  exports: [CardInstanceAccountingComponent],
  entryComponents: []
})
export class CardInstanceAccountingModule {}
