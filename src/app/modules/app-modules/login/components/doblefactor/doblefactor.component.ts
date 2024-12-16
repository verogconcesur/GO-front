import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import LoginDTO from '@data/models/user-permissions/login-dto';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { catchError, finalize, map, Observable, of } from 'rxjs';

export const enum DobleFactorComponentModalEnum {
  ID = 'doble-factor-dialog-id',
  PANEL_CLASS = 'doble-factor-dialog',
  TITLE = 'CÓDIGO DE AUTENTICACIÓN'
}

@Component({
  selector: 'app-doblefactor',
  templateUrl: './doblefactor.component.html',
  styleUrls: ['./doblefactor.component.scss']
})
export class DoblefactorComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('dobleFactor.title'),
    description: marker('dobleFactor.description'),
    code2FA: marker('dobleFactor.code2FA'),
    code2FAError: marker('dobleFactor.code2FAEror'),
    noCheck2FA: marker('dobleFactor.noCheck2FA'),
    send: marker('common.send')
  };

  public dobleFactorForm: UntypedFormGroup;
  public userId: number;
  public f2aMethod: string;
  public qrCode: string;
  public fingerprint: string;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private customDialogService: CustomDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private authenticationService: AuthenticationService
  ) {
    super(DobleFactorComponentModalEnum.ID, DobleFactorComponentModalEnum.PANEL_CLASS, DobleFactorComponentModalEnum.TITLE);
  }

  ngOnInit(): void {
    this.f2aMethod = this.extendedComponentData.type;
    this.userId = this.extendedComponentData.userId;
    this.fingerprint = this.extendedComponentData.fingerprint;
    if (this.extendedComponentData.data?.authenticatorQR) {
      this.qrCode = `data:image/png;base64,${this.extendedComponentData.data?.authenticatorQR}`;
    }

    console.log(this.qrCode);

    this.initializeForm();
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean | LoginDTO> {
    const spinner = this.spinnerService.show();
    return this.authenticationService
      .checkUser2FA({
        userId: this.userId,
        code2FA: this.dobleFactorForm.controls.code2FA.value,
        deviceSignature: this.fingerprint,
        trust: this.dobleFactorForm.controls.trust.value
      })
      .pipe(
        map((response: LoginDTO) => {
          console.log(response);
          this.authenticationService.setLoggedUser(response);
          this.router.navigate(['/', RouteConstants.DASHBOARD]);
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          return response;
        }),
        catchError((error) => {
          this.globalMessageService.showError({
            message: 'El código no es correcto',
            actionText: this.translateService.instant(marker('common.close'))
          });
          return of(false);
        }),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      );
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: this.labels.send,
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.dobleFactorForm.controls.code2FA.value
        }
      ]
    };
  }

  private initializeForm(): void {
    this.dobleFactorForm = this.fb.group({
      code2FA: [''],
      trust: [false]
    });
  }
}
