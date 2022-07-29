/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplatesRoutingModule } from './templates-routing.module';
import { TemplatesComponent } from './templates.component';
import { SharedModule } from '@shared/shared.module';
import { TemplatesFilterComponent } from './components/templates-filter/templates-filter.component';
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';

@NgModule({
  declarations: [TemplatesComponent, TemplatesFilterComponent],
  imports: [
    CommonModule,
    TemplatesRoutingModule,
    SharedModule,
    FilterDrawerModule,
    AdministrationCommonHeaderSectionModule,
    OrganizationLevelsNestedCombosModule
  ]
})
export class TemplatesModule {}
