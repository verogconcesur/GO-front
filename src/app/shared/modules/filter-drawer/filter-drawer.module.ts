import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '@shared/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterDrawerComponent } from './filter-drawer.component';

@NgModule({
  declarations: [FilterDrawerComponent],
  imports: [CommonModule, TranslateModule, MaterialModule, FlexLayoutModule, ReactiveFormsModule],
  exports: [FilterDrawerComponent],
  providers: []
})
export class FilterDrawerModule {}
