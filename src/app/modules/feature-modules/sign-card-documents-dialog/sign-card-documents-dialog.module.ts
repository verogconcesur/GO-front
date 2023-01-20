import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignCardDocumentsDialogComponent } from './sign-card-documents-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { SignCardDocumentsDialogRoutingModule } from './sign-card-documents-dialog-routing.module';

@NgModule({
  declarations: [SignCardDocumentsDialogComponent],
  imports: [CommonModule, SharedModule, SignCardDocumentsDialogRoutingModule]
})
export class SignCardDocumentsDialogModule {}
