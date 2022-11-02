import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowsComponent } from '../workflows/workflows.component';
import { WorkflowsRoutingModule } from './workflows-routing.module';
import { SharedModule } from '@shared/shared.module';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';

@NgModule({
  declarations: [WorkflowsComponent],
  imports: [CommonModule, WorkflowsRoutingModule, SharedModule, FilterDrawerModule, AdministrationCommonHeaderSectionModule]
})
export class WorkflowsModule {}
