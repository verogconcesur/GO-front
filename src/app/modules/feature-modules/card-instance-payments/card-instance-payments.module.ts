import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardInstancePaymentsComponent } from './card-instance-payments.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [CardInstancePaymentsComponent],
  imports: [CommonModule, SharedModule],
  exports: [CardInstancePaymentsComponent],
  entryComponents: []
})
export class CardInstancePaymentsModule {}
