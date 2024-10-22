import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import LoginDTO from '@data/models/user-permissions/login-dto';
import UserDTO from '@data/models/user-permissions/user-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize } from 'rxjs/operators';
import { DoblefactorComponent, DobleFactorComponentModalEnum } from './components/doblefactor/doblefactor.component';
import { UserService } from '@data/services/user.service';

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

  public loginForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: ProgressSpinnerDialogService,
    private authenticationService: AuthenticationService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private customDialogService: CustomDialogService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (this.authenticationService.isUserLogged()) {
      this.router.navigate(['/', RouteConstants.DASHBOARD]);
    } else {
      this.authenticationService.logout();
      this.initializeForm();
    }
  }

  public redirectToforgotPassword(): void {
    this.router.navigate(['./' + RouteConstants.FORGOT_PASSWORD], {
      relativeTo: this.route
    });
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
          sessionStorage.setItem('userName', response.user.userName);
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
    this.authenticationService.setLoggedUser(loginData);

    this.use2FAAndNavigate(loginData);
  }

  private use2FAAndNavigate(loginData: LoginDTO) {
    let user: UserDTO = loginData.user;
    // El 2FA se aplica solo a los usuarios normales y que tengan un email.
    if (user.id > 1000 && user.email != null) {
      // Si existe la cookie 2FA
        //this.router.navigate(['/', RouteConstants.DASHBOARD]);
      // Si no existe la cookie 2FA (porque expira a los 7 días)
        this.openDobleFactorDialog(loginData.user);
    } else {
      this.router.navigate(['/', RouteConstants.DASHBOARD]);
    }
  }

  private loginError(error: ConcenetError): void {
    this.globalMessageService.showError({
      message: error.message,
      actionText: this.translateService.instant(marker('common.close'))
    });
  }

  public openDobleFactorDialog = (user?: UserDTO): void => {
    this.customDialogService
      .open({
        id: DobleFactorComponentModalEnum.ID,
        panelClass: DobleFactorComponentModalEnum.PANEL_CLASS,
        component: DoblefactorComponent,
        width: '500px',
        extendedComponentData:  user
      });
  };
}
