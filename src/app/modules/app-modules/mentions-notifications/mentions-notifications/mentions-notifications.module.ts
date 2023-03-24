import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MentionsNotificationsRoutingModule } from './mentions-notifications-routing.module';
import { MentionsNotificationsComponent } from './mentions-notifications.component';
import { SharedModule } from '@shared/shared.module';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { MentionsComponent } from '../components/mentions/mentions.component';

@NgModule({
  declarations: [MentionsNotificationsComponent, NotificationsComponent, MentionsComponent],
  imports: [CommonModule, SharedModule, MentionsNotificationsRoutingModule]
})
export class MentionsNotificationsModule {}
