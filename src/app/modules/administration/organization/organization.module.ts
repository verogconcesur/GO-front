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
import { TextEditorWrapperModule } from '@modules/text-editor-wrapper/text-editor-wrapper.module';
import { CreateEditFacilityComponent } from './components/create-edit-facility/create-edit-facility.component';

@NgModule({
  declarations: [
    OrganizationComponent,
    BrandsComponent,
    FacilitiesComponent,
    DepartmentsComponent,
    SpecialtiesComponent,
    OrganizationCardComponent,
    CreateEditBrandComponent,
    CreateEditFacilityComponent
  ],
  imports: [CommonModule, SharedModule, TextEditorWrapperModule, OrganizationRoutingModule]
})
export class OrganizationModule {}
