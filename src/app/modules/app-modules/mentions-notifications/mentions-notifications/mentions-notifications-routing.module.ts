import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { MentionsNotificationsComponent } from './mentions-notifications.component';

const routes: Routes = [{ path: RouteConstants.EMPTY, component: MentionsNotificationsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MentionsNotificationsRoutingModule {}
