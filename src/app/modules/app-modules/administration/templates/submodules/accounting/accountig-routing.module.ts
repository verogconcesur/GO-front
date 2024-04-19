import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants, RoutePermissionConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { AccountingsComponent } from './accountig.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    canActivate: [AuthGuardService],
    data: { permissions: RoutePermissionConstants.ADMINISTRATION },
    children: [
      {
        path: RouteConstants.EMPTY,
        canActivate: [AuthGuardService],
        component: AccountingsComponent
      },
      {
        path: RouteConstants.OTHER,
        pathMatch: 'full',
        redirectTo: RouteConstants.EMPTY
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
export class AccountingsRoutingModule {}
