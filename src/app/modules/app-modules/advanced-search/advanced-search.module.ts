import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { AdvancedSearchRoutingModule } from './advanced-search-routing.module';
import { AdvancedSearchComponent } from './advanced-search.component';
import { AdvSearchCardTableComponent } from './components/adv-search-card-table/adv-search-card-table.component';
import { AdvSearchCriteriaDialogComponent } from './components/adv-search-criteria-dialog/adv-search-criteria-dialog.component';
// eslint-disable-next-line max-len
import { GenericTreeNodeSearcherModule } from '@modules/feature-modules/generic-tree-node-searcher/generic-tree-node-searcher.module';
// eslint-disable-next-line max-len
import { AdvSearchCriteriaEditionDialogComponent } from './components/adv-search-criteria-edition-dialog/adv-search-criteria-edition-dialog.component';
import { AdvSearchSaveFavDialogComponent } from './components/adv-search-save-fav-dialog/adv-search-save-fav-dialog.component';

@NgModule({
  declarations: [
    AdvancedSearchComponent,
    AdvSearchCardTableComponent,
    AdvSearchCriteriaDialogComponent,
    AdvSearchCriteriaEditionDialogComponent,
    AdvSearchSaveFavDialogComponent
  ],
  imports: [CommonModule, SharedModule, AdvancedSearchRoutingModule, GenericTreeNodeSearcherModule]
})
export class AdvancedSearchModule {}
