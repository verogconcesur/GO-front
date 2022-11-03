import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowsRoutingModule } from './workflows-routing.module';
import { SharedModule } from '@shared/shared.module';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { WorkflowDetailComponent } from './components/workflow-detail/workflow-detail.component';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';
import { WorkflowsTableComponent } from './components/workflows-table/workflows-table.component';
import { WorkflowsFilterComponent } from './components/workflows-filter/workflows-filter.component';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';

@NgModule({
  declarations: [WorkflowDetailComponent, WorkflowListComponent, WorkflowsTableComponent, WorkflowsFilterComponent],
  imports: [
    CommonModule,
    WorkflowsRoutingModule,
    SharedModule,
    FilterDrawerModule,
    AdministrationCommonHeaderSectionModule,
    OrganizationLevelsNestedCombosModule
  ]
})
export class WorkflowsModule {}
