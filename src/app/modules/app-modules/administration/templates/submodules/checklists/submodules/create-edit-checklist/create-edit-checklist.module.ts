import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateEditChecklistComponent } from './create-edit-checklist.component';
import { SharedModule } from '@shared/shared.module';
import { CreateEditChecklistsRoutingModule } from './create-edit-checklist-routing.module';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@NgModule({
  declarations: [CreateEditChecklistComponent],
  imports: [
    CommonModule,
    SharedModule,
    CreateEditChecklistsRoutingModule,
    OrganizationLevelsNestedCombosModule,
    NgxExtendedPdfViewerModule
  ]
})
export class CreateEditChecklistModule {}
