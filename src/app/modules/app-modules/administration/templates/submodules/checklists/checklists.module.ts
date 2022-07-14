import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChecklistsRoutingModule } from './checklists-routing.module';
import { ChecklistsComponent } from './checklists.component';


@NgModule({
  declarations: [
    ChecklistsComponent
  ],
  imports: [
    CommonModule,
    ChecklistsRoutingModule
  ]
})
export class ChecklistsModule { }
