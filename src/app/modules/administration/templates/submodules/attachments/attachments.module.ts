import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttachmentsRoutingModule } from './attachments-routing.module';
import { AttachmentsComponent } from './attachments.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    AttachmentsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AttachmentsRoutingModule
  ]
})
export class AttachmentsModule { }
