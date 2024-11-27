import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import LoginDTO from '@data/models/user-permissions/login-dto';
import UserDTO from '@data/models/user-permissions/user-dto';
import { UserService } from '@data/services/user.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize, take } from 'rxjs/operators';
import {
  ChooseDoblefactorComponent,
  ChooseDobleFactorOptionComponentModalEnum
} from './components/choose-doublefactor-option/choose-doublefactor-option.component';

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
    @Inject(ENV) private env: Env,
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

  public get appVersion(): string {
    if (this.env.appVersion.includes('-')) {
      return `v${this.env.appVersion.split('-')[0]}`;
    }
    return `v${this.env.appVersion}`;
  }

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
    //Back puede obtener la informacion de la cabecera con userAgent pero es poco seguro
    //Opcion de usar ClientJS una libreria de javascript
    //Utilizar una combinacion de informacion para generar un id unico para back
    // e identificar si se esta usando un navegador conocido.
    // const browserFingerprint = this.generateBrowserFingerprint();
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public openDobleFactorDialog = (config: any): void => {
    this.customDialogService
      .open({
        id: ChooseDobleFactorOptionComponentModalEnum.ID,
        panelClass: ChooseDobleFactorOptionComponentModalEnum.PANEL_CLASS,
        component: ChooseDoblefactorComponent,
        width: '700px',
        extendedComponentData: config
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.customDialogService.close(ChooseDobleFactorOptionComponentModalEnum.ID);
        }
      });
  };

  // private generateBrowserFingerprint(): string {
  //   const userAgent = window.navigator.userAgent;
  //   const screenResolution = window.screen.width + 'x' + window.screen.height;
  //   const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //   return btoa(`${userAgent}_${screenResolution}_${timezone}`);
  // }

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
    const user: UserDTO = loginData.user;
    // El 2FA se aplica solo a los usuarios normales y que tengan un email.
    // if (user.id > 1000 && user.email != null) {
    //   // Si existe la cookie 2FA
    //   //this.router.navigate(['/', RouteConstants.DASHBOARD]);
    //   // Si no existe la cookie 2FA (porque expira a los 7 días)
    //   this.openDobleFactorDialog(loginData.user);
    // } else {
    //   this.router.navigate(['/', RouteConstants.DASHBOARD]);
    // }
    this.authenticationService
      .getF2AConfig()
      .pipe(take(1))
      .subscribe((resp) => {
        console.log(resp);
        if (resp.f2a) {
          if (!resp.a2aPredefined) {
            this.openDobleFactorDialog(resp);
          } else {
            //Si tiene un metodo predefinido se llama al metodo de back y se abre la modal para introducir directamente el codigo
          }
        } else {
          this.router.navigate(['/', RouteConstants.DASHBOARD]);
        }
      });
  }

  private loginError(error: ConcenetError): void {
    this.globalMessageService.showError({
      message: error.message,
      actionText: this.translateService.instant(marker('common.close'))
    });
  }
}
