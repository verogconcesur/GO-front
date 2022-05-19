import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants, RoutePermissionConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { AdministrationLayoutComponent } from '@layout/administration-layout/administration-layout.component';
import { DashboardLayoutComponent } from '@layout/dashboard-layout/dashboard-layout.component';

const routes: Routes = [
  {
    path: RouteConstants.LOGIN,
    loadChildren: () => import('./modules/login/login.module').then((m) => m.LoginModule)
  },
  {
    path: RouteConstants.DASHBOARD,
    component: DashboardLayoutComponent,
    canActivate: [AuthGuardService]
    // data: { permissions: RoutePermissionConstants.DASHBOARD }
    // loadChildren: () => import('./modules/login/login.module').then((m) => m.LoginModule)
  },
  {
    path: RouteConstants.ADMINISTRATION,
    component: AdministrationLayoutComponent,
    canActivate: [AuthGuardService],
    // data: { permissions: RoutePermissionConstants.ADMINISTRATION }
    children: [
      {
        path: RouteConstants.USERS,
        canActivate: [AuthGuardService],
        loadChildren: () => import('./modules/administration/users/users.module').then((m) => m.UsersModule)
      },
      {
        path: RouteConstants.OTHER,
        pathMatch: 'full',
        redirectTo: RouteConstants.USERS
      }
    ]
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
