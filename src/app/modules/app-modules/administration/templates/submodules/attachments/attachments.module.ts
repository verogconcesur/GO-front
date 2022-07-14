import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttachmentsRoutingModule } from './attachments-routing.module';
import { AttachmentsComponent } from './attachments.component';
import { SharedModule } from '@shared/shared.module';
import { CreateEditAttachmentComponent } from './dialog/create-edit-attachment/create-edit-attachment.component';


@NgModule({
  declarations: [
    AttachmentsComponent,
    CreateEditAttachmentComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AttachmentsRoutingModule
  ]
})
export class AttachmentsModule { }
