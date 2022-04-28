import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import LoginDTO from '@data/models/login-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public labels = {
    title: marker('login.title'),
    description: marker('login.description'),
    email: marker('login.email'),
    password: marker('login.password'),
    forgotPassword: marker('login.forgotPassword'),
    signIn: marker('login.signIn'),
    userNameRequired: marker('login.userNameRequired'),
    passwordRequired: marker('login.passwordRequired')
  };

  public loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private spinnerService: ProgressSpinnerDialogService,
    private authenticationService: AuthenticationService,
    private globalMessageService: GlobalMessageService
  ) {}

  ngOnInit(): void {
    if (this.authenticationService.isUserLogged()) {
      this.router.navigate([RouteConstants.DASHBOARD]);
    } else {
      this.initializeForm();
    }
  }

  public doLogin(): void {
    const spinner = this.spinnerService.show();

    this.authenticationService
      .signIn(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.spinnerService.hide(spinner);
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: (response: LoginDTO) => {
          this.loginSuccess(response);
        },
        error: (error: ConcenetError) => {
          this.loginError(error);
        }
      });
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  private loginSuccess(loginData: LoginDTO): void {
    // this.router.navigate([RouteConstants.DASHBOARD]);
    this.authenticationService.setLoggedUser(loginData);
    this.authenticationService.keepTokenAlive(loginData.access_token, loginData.expires_in);
  }

  private loginError(error: ConcenetError): void {
    this.globalMessageService.showError({
      message: error.message,
      actionText: 'Close'
    });
  }
}
