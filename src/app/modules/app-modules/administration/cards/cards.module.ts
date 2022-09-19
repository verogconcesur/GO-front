import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardsRoutingModule } from './cards-routing.module';
import { CardsComponent } from './cards.component';
import { SharedModule } from '@shared/shared.module';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';
import { CardsListComponent } from './components/cards-list/cards-list.component';
import { CreateEditCardComponent } from './components/create-edit-card/create-edit-card.component';
import { CustomColumnComponent } from './components/custom-column/custom-column.component';
import { CustomCommentsComponent } from './components/custom-comments/custom-comments.component';
import { CustomActionsComponent } from './components/custom-actions/custom-actions.component';
import { EntityTabComponent } from './components/entity-tab/entity-tab.component';


@NgModule({
  declarations: [
    CardsComponent,
    CardsListComponent,
    CreateEditCardComponent,
    CustomColumnComponent,
    CustomCommentsComponent,
    CustomActionsComponent,
    EntityTabComponent
  ],
  imports: [
    CommonModule,
    CardsRoutingModule,
    SharedModule,
    FilterDrawerModule,
    AdministrationCommonHeaderSectionModule
  ]
})
export class CardsModule { }
