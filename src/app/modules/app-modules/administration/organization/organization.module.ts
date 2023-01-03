/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { BrandsComponent } from './components/brands/brands.component';
import { SharedModule } from '@shared/shared.module';
import { FacilitiesComponent } from './components/facilities/facilities.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { SpecialtiesComponent } from './components/specialties/specialties.component';
import { OrganizationComponent } from './organization.component';
import { OrganizationCardComponent } from './components/organization-card/organization-card.component';
import { CreateEditBrandComponent } from './components/create-edit-brand/create-edit-brand.component';
import { TextEditorWrapperModule } from '@modules/feature-modules/text-editor-wrapper/text-editor-wrapper.module';
import { CreateEditFacilityComponent } from './components/create-edit-facility/create-edit-facility.component';
import { CreateEditDepartmentComponent } from './components/create-edit-department/create-edit-department.component';
import { CreateEditSpecialtyComponent } from './components/create-edit-specialty/create-edit-specialty.component';
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { BreadCrumbsModule } from '@jenga/bread-crumbs';
import { GenericTreeNodeSearcherModule } from '@modules/feature-modules/generic-tree-node-searcher/generic-tree-node-searcher.module';

@NgModule({
  declarations: [
    OrganizationComponent,
    BrandsComponent,
    FacilitiesComponent,
    DepartmentsComponent,
    SpecialtiesComponent,
    OrganizationCardComponent,
    CreateEditBrandComponent,
    CreateEditFacilityComponent,
    CreateEditDepartmentComponent,
    CreateEditSpecialtyComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TextEditorWrapperModule,
    BreadCrumbsModule,
    OrganizationRoutingModule,
    AdministrationCommonHeaderSectionModule,
    OrganizationLevelsNestedCombosModule,
    GenericTreeNodeSearcherModule
  ]
})
export class OrganizationModule {}
