/* eslint-disable max-len */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { GenericTreeNodeSearcherModule } from '@modules/feature-modules/generic-tree-node-searcher/generic-tree-node-searcher.module';
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { TextEditorWrapperModule } from '@modules/feature-modules/text-editor-wrapper/text-editor-wrapper.module';
import { BreadCrumbsModule } from '@shared/modules/bread-crumbs/bread-crumbs.module';
import { SharedModule } from '@shared/shared.module';
import { BrandsComponent } from './components/brands/brands.component';
import { CreateEditBrandComponent } from './components/create-edit-brand/create-edit-brand.component';
import { CreateEditDepartmentComponent } from './components/create-edit-department/create-edit-department.component';
import { CreateEditFacilityComponent } from './components/create-edit-facility/create-edit-facility.component';
import { CreateEditSpecialtyComponent } from './components/create-edit-specialty/create-edit-specialty.component';
import { CsvFileImportationComponent } from './components/csv-file-importation/csv-file-importation.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { FacilitiesComponent } from './components/facilities/facilities.component';
import { OrganizationCardComponent } from './components/organization-card/organization-card.component';
import { SpecialtiesComponent } from './components/specialties/specialties.component';
import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationComponent } from './organization.component';

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
    CreateEditSpecialtyComponent,
    CsvFileImportationComponent
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
