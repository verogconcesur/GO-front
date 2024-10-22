import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { RestorePasswordComponent } from './components/restore-password/restore-password.component';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { UpdatePasswordComponent } from './components/update-password/update-password.component';
import { DoblefactorComponent } from './components/doblefactor/doblefactor.component';

@NgModule({
  declarations: [LoginComponent, ForgotPasswordComponent, RestorePasswordComponent, UpdatePasswordComponent, DoblefactorComponent],
  imports: [CommonModule, LoginRoutingModule, SharedModule]
})
export class LoginModule {}
