import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ChooseDoblefactorComponent } from './components/choose-doublefactor-option/choose-doublefactor-option.component';
import { DoblefactorComponent } from './components/doblefactor/doblefactor.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ModalFetchDataPreF2AComponent } from './components/modal-fetch-data-pre-f2a/modal-fetch-data-pre-f2a.component';
import { RestorePasswordComponent } from './components/restore-password/restore-password.component';
import { UpdatePasswordComponent } from './components/update-password/update-password.component';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

@NgModule({
  // eslint-disable-next-line max-len
  declarations: [
    LoginComponent,
    ForgotPasswordComponent,
    RestorePasswordComponent,
    UpdatePasswordComponent,
    DoblefactorComponent,
    ChooseDoblefactorComponent,
    ModalFetchDataPreF2AComponent
  ],
  imports: [CommonModule, LoginRoutingModule, SharedModule]
})
export class LoginModule {}
