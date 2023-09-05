import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardInstancePaymentsComponent } from './card-instance-payments.component';
import { SharedModule } from '@shared/shared.module';
import { CardPaymentDialogFormComponent } from './card-payment-dialog-form/card-payment-dialog-form.component';

@NgModule({
  declarations: [CardInstancePaymentsComponent, CardPaymentDialogFormComponent],
  imports: [CommonModule, SharedModule],
  exports: [CardInstancePaymentsComponent],
  entryComponents: []
})
export class CardInstancePaymentsModule {}
