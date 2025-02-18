import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModulesConstants } from '@app/constants/modules.constants';
import { RouteConstants, RoutePermissionConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { ModularizationGuard } from '@app/security/guards/modularization.guard';
import { LandingBannersComponent } from './components/landing-banners/landing-banners.component';
import { LandingConfigComponent } from './components/landing-config/landing-config.component';
import { LandingLinksComponent } from './components/landing-links/landing-links.component';
import { LandingComponent } from './landing.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: LandingComponent,
    canActivate: [AuthGuardService, ModularizationGuard],
    data: { permissions: RoutePermissionConstants.ADMINISTRATION, requiredModule: ModulesConstants.TIME_LINE },
    children: [
      {
        path: RouteConstants.ADM_LANDING_GLOBAL_CONFIG,
        canActivate: [AuthGuardService],
        component: LandingConfigComponent
      },
      {
        path: RouteConstants.ADM_LANDING_LINKS_CONFIG,
        canActivate: [AuthGuardService],
        component: LandingLinksComponent
      },
      {
        path: RouteConstants.ADM_LANDING_BANNERS_CONFIG,
        canActivate: [AuthGuardService],
        component: LandingBannersComponent
      },
      {
        path: RouteConstants.OTHER,
        pathMatch: 'full',
        redirectTo: RouteConstants.ADM_LANDING_GLOBAL_CONFIG
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule {}
