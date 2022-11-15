import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSearcherDialogComponent } from './user-searcher-dialog.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [UserSearcherDialogComponent],
  imports: [CommonModule, SharedModule],
  exports: [UserSearcherDialogComponent]
})
export class UserSearcherDialogModule {}
