import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { RestorePasswordComponent } from './components/restore-password/restore-password.component';
import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: RouteConstants.EMPTY, component: LoginComponent },
  {
    path: RouteConstants.FORGOT_PASSWORD,
    component: ForgotPasswordComponent
  },
  {
    path: RouteConstants.RESTORE_PASSWORD,
    component: RestorePasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule {}
