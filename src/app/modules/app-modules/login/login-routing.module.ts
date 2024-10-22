import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { RestorePasswordComponent } from './components/restore-password/restore-password.component';
import { LoginComponent } from './login.component';
import { UpdatePasswordComponent } from './components/update-password/update-password.component';

const routes: Routes = [
  { path: RouteConstants.EMPTY, component: LoginComponent },
  {
    path: RouteConstants.FORGOT_PASSWORD,
    component: ForgotPasswordComponent
  },
  {
    path: RouteConstants.RESTORE_PASSWORD,
    component: RestorePasswordComponent
  },
  { path: RouteConstants.UPDATE_PASSWORD, component: UpdatePasswordComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule {}
