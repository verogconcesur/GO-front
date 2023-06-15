import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { AdvancedSearchRoutingModule } from './advanced-search-routing.module';
import { AdvancedSearchComponent } from './advanced-search.component';
import { AdvSearchCardTableComponent } from './components/adv-search-card-table/adv-search-card-table.component';

@NgModule({
  declarations: [AdvancedSearchComponent, AdvSearchCardTableComponent],
  imports: [CommonModule, SharedModule, AdvancedSearchRoutingModule]
})
export class AdvancedSearchModule {}
