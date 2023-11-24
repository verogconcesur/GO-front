import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ClientTimelineComponent } from './client-timeline.component';

const routes: Routes = [{ path: RouteConstants.EMPTY, component: ClientTimelineComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientTimelineRoutingModule {}
