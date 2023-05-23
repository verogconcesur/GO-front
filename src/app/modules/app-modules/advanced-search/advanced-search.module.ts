import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { AdvancedSearchRoutingModule } from './advanced-search-routing.module';
import { AdvancedSearchComponent } from './advanced-search.component';

@NgModule({
  declarations: [AdvancedSearchComponent],
  imports: [CommonModule, SharedModule, AdvancedSearchRoutingModule]
})
export class AdvancedSearchModule {}
