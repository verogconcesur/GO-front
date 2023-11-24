import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalInsertSignComponent } from './modal-insert-sign.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ModalInsertSignComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalInsertSignComponent]
})
export class ModalInsertSignModule {}
