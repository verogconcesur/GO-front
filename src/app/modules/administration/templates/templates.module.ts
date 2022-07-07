import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplatesRoutingModule } from './templates-routing.module';
import { TemplatesComponent } from './templates.component';
import { ClientTimelineComponent } from './submodules/client-timeline/client-timeline.component';
import { SharedModule } from '@shared/shared.module';
import { TemplatesFilterComponent } from './components/templates-filter/templates-filter.component';

@NgModule({
  declarations: [TemplatesComponent, ClientTimelineComponent, TemplatesFilterComponent],
  imports: [CommonModule, TemplatesRoutingModule, SharedModule]
})
export class TemplatesModule {}
