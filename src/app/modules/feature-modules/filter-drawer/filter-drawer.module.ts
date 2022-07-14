import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FilterDrawerComponent } from './filter-drawer.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [FilterDrawerComponent],
  imports: [CommonModule, TranslateModule, SharedModule],
  exports: [FilterDrawerComponent],
  providers: []
})
export class FilterDrawerModule {}
