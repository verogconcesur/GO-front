import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationLevelsNestedCombosComponent } from './organization-levels-nested-combos.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [OrganizationLevelsNestedCombosComponent],
  imports: [CommonModule, SharedModule],
  exports: [OrganizationLevelsNestedCombosComponent]
})
export class OrganizationLevelsNestedCombosModule {}
