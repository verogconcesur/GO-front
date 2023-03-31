import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MentionsNotificationsRoutingModule } from './mentions-notifications-routing.module';
import { MentionsNotificationsComponent } from './mentions-notifications.component';
import { SharedModule } from '@shared/shared.module';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { MentionsComponent } from '../components/mentions/mentions.component';
// eslint-disable-next-line max-len
import { MentionsNotificationsHeaderComponent } from '../components/mentions-notifications-header/mentions-notifications-header.component';
import { NotificationsFilterComponent } from '../components/notifications-filter/notifications-filter.component';
import { MentionsFilterComponent } from '../components/mentions-filter/mentions-filter.component';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';

@NgModule({
  declarations: [
    MentionsNotificationsComponent,
    NotificationsComponent,
    MentionsComponent,
    MentionsNotificationsHeaderComponent,
    NotificationsFilterComponent,
    MentionsFilterComponent
  ],
  imports: [CommonModule, SharedModule, MentionsNotificationsRoutingModule, FilterDrawerModule]
})
export class MentionsNotificationsModule {}
