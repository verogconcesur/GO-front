import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttachmentsRoutingModule } from './attachments-routing.module';
import { AttachmentsComponent } from './attachments.component';


@NgModule({
  declarations: [
    AttachmentsComponent
  ],
  imports: [
    CommonModule,
    AttachmentsRoutingModule
  ]
})
export class AttachmentsModule { }
