import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyProfileComponent } from './my-profile.component';
import { SharedModule } from '@shared/shared.module';
import { ModalInsertSignModule } from '../modal-insert-sign/modal-insert-sign.module';

@NgModule({
  declarations: [MyProfileComponent],
  imports: [CommonModule, SharedModule, ModalInsertSignModule],
  exports: [MyProfileComponent]
})
export class MyProfileDialogModule {}
