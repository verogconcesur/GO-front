import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants, RoutePermissionConstants, RoutingUseHash } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { AdministrationLayoutComponent } from '@layout/administration-layout/administration-layout.component';
import { DashboardLayoutComponent } from '@layout/dashboard-layout/dashboard-layout.component';

const routes: Routes = [
  {
    path: RouteConstants.LOGIN,
    loadChildren: () => import('./modules/app-modules/login/login.module').then((m) => m.LoginModule)
  },
  {
    path: RouteConstants.DASHBOARD,
    component: DashboardLayoutComponent,
    canActivate: [AuthGuardService],
    data: { permissions: RoutePermissionConstants.DASHBOARD },
    children: [
      {
        path: RouteConstants.WORKFLOWS,
        canActivate: [AuthGuardService],
        loadChildren: () => import('./modules/app-modules/workflow/workflow.module').then((m) => m.WorkflowModule)
      },
      {
        path: RouteConstants.EMPTY,
        canActivate: [AuthGuardService],
        redirectTo: RouteConstants.WORKFLOWS
      }
    ]
    // loadChildren: () => import('./modules/app-modules/login/login.module').then((m) => m.LoginModule)
  },
  {
    path: RouteConstants.ADMINISTRATION,
    component: AdministrationLayoutComponent,
    canActivate: [AuthGuardService],
    data: { permissions: RoutePermissionConstants.ADMINISTRATION },
    children: [
      {
        path: RouteConstants.USERS,
        canActivate: [AuthGuardService],
        loadChildren: () => import('./modules/app-modules/administration/users/users.module').then((m) => m.UsersModule)
      },
      {
        path: RouteConstants.ORGANIZATION,
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./modules/app-modules/administration/organization/organization.module').then((m) => m.OrganizationModule)
      },
      {
        path: RouteConstants.TEMPLATES,
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./modules/app-modules/administration/templates/templates.module').then((m) => m.TemplatesModule)
      },
      {
        path: RouteConstants.CARDS,
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./modules/app-modules/administration/cards/cards.module').then((m) => m.CardsModule)
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
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', useHash: RoutingUseHash })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
