import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommunicationRoutingModule } from './communication-routing.module';
import { CommunicationComponent } from './communication.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    CommunicationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CommunicationRoutingModule
  ]
})
export class CommunicationModule { }
