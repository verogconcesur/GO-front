import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants, RoutePermissionConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { DashboardLayoutComponent } from '@layout/dashboard-layout/dashboard-layout.component';

const routes: Routes = [
  {
    path: RouteConstants.LOGIN,
    loadChildren: () => import('./modules/login/login.module').then((m) => m.LoginModule)
  },
  {
    path: RouteConstants.DASHBOARD,
    component: DashboardLayoutComponent,
    canActivate: [AuthGuardService],
    data: { permissions: RoutePermissionConstants.DASHBOARD }
    // loadChildren: () => import('./modules/login/login.module').then((m) => m.LoginModule)
  },
  {
    path: RouteConstants.OTHER,
    pathMatch: 'full',
    redirectTo: RouteConstants.LOGIN
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
