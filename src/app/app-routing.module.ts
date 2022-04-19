import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { DefaultLayoutComponent } from '@layout/default-layout/default-layout.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: DefaultLayoutComponent
  },
  {
    path: RouteConstants.OTHER,
    pathMatch: 'full',
    redirectTo: RouteConstants.EMPTY
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
