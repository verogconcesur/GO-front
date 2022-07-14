import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministrationCommonHeaderSectionComponent } from './administration-common-header-section.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [AdministrationCommonHeaderSectionComponent],
  imports: [CommonModule, SharedModule],
  exports: [AdministrationCommonHeaderSectionComponent]
})
export class AdministrationCommonHeaderSectionModule {}
