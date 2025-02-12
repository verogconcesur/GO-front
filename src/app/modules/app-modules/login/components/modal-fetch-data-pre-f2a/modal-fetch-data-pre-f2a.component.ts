import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import LoginDTO from '@data/models/user-permissions/login-dto';
import { UserService } from '@data/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { catchError, finalize, map, Observable, of } from 'rxjs';

export const enum ModalFetchDataPreF2AComponentEnum {
  ID = 'modal-pre-f2a-dialog-id',
  PANEL_CLASS = 'modal-pre-f2a-dialog',
  TITLE = 'preF2a.title'
}

@Component({
  selector: 'app-modal-fetch-data-pre-f2a',
  templateUrl: './modal-fetch-data-pre-f2a.component.html',
  styleUrls: ['./modal-fetch-data-pre-f2a.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalFetchDataPreF2AComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    sms: marker('preF2a.sms'),
    description: marker('preF2a.description'),
    email: marker('preF2a.email'),
    error: marker('preF2a.error')
  };

  public userId: number;
  public email: string;
  public phoneNumber: string;
  public preF2aForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userservice: UserService,
    private customDialogService: CustomDialogService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private authenticationService: AuthenticationService
  ) {
    super(
      ModalFetchDataPreF2AComponentEnum.ID,
      ModalFetchDataPreF2AComponentEnum.PANEL_CLASS,
      ModalFetchDataPreF2AComponentEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.userId = this.extendedComponentData.id;
    this.phoneNumber = this.extendedComponentData.phoneNumber;
    this.email = this.extendedComponentData.email;
    this.initializeForm();
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean | LoginDTO> {
    const spinner = this.spinnerService.show();
    return this.authenticationService
      .sendEmailAndPhone({
        userId: this.userId,
        email: this.preF2aForm.controls.email.value,
        phoneNumber: this.preF2aForm.controls.phone.value
      })
      .pipe(
        map((response) => {
          if (response) {
            this.authenticationService.setLoggedUser(response);
          }
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          return response;
        }),
        catchError((error) => {
          this.globalMessageService.showError({
            message: error.error.message,
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
          label: 'Guardar',
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.preF2aForm.valid
        }
      ]
    };
  }

  private initializeForm(): void {
    this.preF2aForm = this.fb.group(
      {
        email: [this.email ? this.email : ''],
        phone: [this.phoneNumber ? this.phoneNumber : '']
      },
      { validators: this.atLeastOneRequiredValidator }
    );
  }

  private atLeastOneRequiredValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const email = form.get('email')?.value;
    const phone = form.get('phone')?.value;
    if (!email && !phone) {
      return { atLeastOneRequired: true };
    }
    return null;
  }
}
