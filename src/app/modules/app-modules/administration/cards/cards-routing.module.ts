import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants, RoutePermissionConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { CardsComponent } from './cards.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: CardsComponent,
    canActivate: [AuthGuardService],
    data: { permissions: RoutePermissionConstants.ADMINISTRATION },
    children: [
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
export class CardsRoutingModule { }
