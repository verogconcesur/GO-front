import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyProfileComponent } from './my-profile.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [MyProfileComponent],
  imports: [CommonModule, SharedModule],
  exports: [MyProfileComponent]
})
export class MyProfileDialogModule {}
