import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttachmentsComponent } from './attachments.component';
import { RouteConstants } from '@app/constants/route.constants';

const routes: Routes = [{ path: RouteConstants.EMPTY, component: AttachmentsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttachmentsRoutingModule {}
