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
import { DoblefactorComponent, DobleFactorComponentModalEnum } from './components/doblefactor/doblefactor.component';

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
  public fingerprint: string;

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
      this.fingerprint = this.generateBrowserFingerprint();
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
    this.loginForm.get('deviceSignature').setValue(this.fingerprint);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public openChooseDobleFactorDialog = (config: any): void => {
    console.log(config);
    this.customDialogService
      .open({
        id: ChooseDobleFactorOptionComponentModalEnum.ID,
        panelClass: ChooseDobleFactorOptionComponentModalEnum.PANEL_CLASS,
        component: ChooseDoblefactorComponent,
        width: '700px',
        extendedComponentData: { id: config.user.id, phone: config.user.phoneNumber, email: config.user.email }
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.customDialogService.close(ChooseDobleFactorOptionComponentModalEnum.ID);
        }
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public openDobleFactorDialog = (userId: number, fingerprint: string, type: string): void => {
    this.authenticationService
      .sendF2APass(userId, type)
      .pipe(untilDestroyed(this))
      .subscribe((resp) => {
        this.customDialogService
          .open({
            id: DobleFactorComponentModalEnum.ID,
            panelClass: DobleFactorComponentModalEnum.PANEL_CLASS,
            component: DoblefactorComponent,
            width: '500px',
            extendedComponentData: { userId, type, fingerprint, qr: resp || null }
          })
          .pipe(take(1))
          .subscribe((response) => {
            if (response) {
              this.customDialogService.close(DobleFactorComponentModalEnum.ID);
            }
          });
      });
  };

  private generateBrowserFingerprint(): string {
    // Obtener User Agent del navegador
    const userAgent = window.navigator.userAgent;
    // Obtener la zona horaria
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Obtener puntos tactiles de la pantalla
    const tactil = window.navigator.maxTouchPoints;
    // Obtener GPU (WebGL info)
    const gpuInfo = this.getWebGLInfo();
    // Combinar todo en una cadena y codificar en Base64
    const fingerprintData = `${userAgent}__${timezone}_${tactil}_${gpuInfo}`;
    console.log(fingerprintData);
    // Codificar en Base64 para que sea más compacto
    return btoa(fingerprintData);
  }

  private getWebGLInfo(): string {
    // Crear un elemento 'canvas' que se utilizará para obtener el contexto WebGL
    const canvas = document.createElement('canvas');
    // Intentar obtener el contexto de WebGL de forma explícita.
    // 'getContext("webgl")' devuelve el contexto WebGL si está disponible.
    // Si no está disponible, 'getContext("experimental-webgl")'
    //intenta usar una versión experimental de WebGL en navegadores más antiguos.
    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext);
    // Si no se puede obtener el contexto WebGL, significa que el navegador no soporta WebGL.
    // En ese caso, se devuelve 'NaN' para indicar que no se puede obtener la información.
    if (!gl) {
      return 'NaN';
    }
    // Intentar obtener la extensión 'WEBGL_debug_renderer_info', que proporciona detalles más específicos sobre la GPU.
    // Esta extensión permite acceder al fabricante (vendor) y al modelo (renderer) de la tarjeta gráfica.
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    // Si la extensión no está disponible (algunos navegadores pueden bloquearla por privacidad o seguridad),
    // se devuelve 'NaN', indicando que no se puede obtener información de la GPU.
    if (!debugInfo) {
      return 'NaN';
    }
    // Obtener el nombre del fabricante de la GPU.
    // 'UNMASKED_VENDOR_WEBGL' es el parámetro que devuelve el
    //fabricante de la tarjeta gráfica (por ejemplo, "NVIDIA", "Intel", "AMD").
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'NaN';
    // Obtener el nombre del modelo de la GPU.
    // 'UNMASKED_RENDERER_WEBGL' es el parámetro que devuelve el
    //modelo exacto de la tarjeta gráfica (por ejemplo, "GeForce GTX 1050").
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'NaN';
    // Devolver un identificador único basado en la combinación del fabricante y el modelo de la GPU.
    // Si no se pueden obtener estos valores, se devolverá 'NaN' como valor predeterminado.
    return `${vendor}_${renderer}`;
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      deviceSignature: [null]
    });
  }

  private loginSuccess(loginData: LoginDTO): void {
    console.log(loginData);
    this.authenticationService.setLoggedUser(loginData);
    this.use2FAAndNavigate(loginData);
  }

  private use2FAAndNavigate(loginData: LoginDTO) {
    // Extraemos las propiedades necesarias de loginData
    const { require2FA, defaultMode2FA, user } = loginData;
    const email = user.email;
    const phoneNumber = user.phoneNumber;
    if (require2FA) {
      let isPredefinedValid = true;
      // Validamos el modo de 2FA predefinido
      if (defaultMode2FA === 'EMAIL' && !email) {
        isPredefinedValid = false; // Si es EMAIL pero no hay email, es inválido
      } else if (defaultMode2FA === 'SMS' && !phoneNumber) {
        isPredefinedValid = false; // Si es SMS pero no hay número de teléfono, es inválido
      }
      // Si no hay defaultMode2FA o no es válido (ni EMAIL ni SMS válidos)
      if (!defaultMode2FA || !isPredefinedValid) {
        // Abrimos el modal para que el usuario elija el método de doble factor
        this.openChooseDobleFactorDialog(loginData);
      } else {
        // Abrimos el modal para introducir el código según el método predefinido
        this.openDobleFactorDialog(loginData.user.id, this.fingerprint, defaultMode2FA);
      }
    } else {
      // Si require2FA es falso, navegamos directamente al dashboard
      this.router.navigate(['/', RouteConstants.DASHBOARD]);
    }
  }

  private loginError(error: ConcenetError): void {
    this.globalMessageService.showError({
      message: error.message,
      actionText: this.translateService.instant(marker('common.close'))
    });
  }
}
