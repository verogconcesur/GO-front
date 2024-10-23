import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { passwordPattern } from '@app/constants/patterns.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { UserService } from '@data/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import ConfirmPasswordValidator from '@shared/validators/confirm-password.validator';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit {
  public updatePasswordForm: UntypedFormGroup;
  public userName = '';

  public labels = {
    title: marker('updatePassword.title'),
    description: marker('updatePassword.description'),
    userName: marker('updatePassword.userName'),
    password1: marker('updatePassword.password1'),
    password2: marker('updatePassword.password2'),
    save: marker('updatePassword.save'),
    passwordRequired: marker('updatePassword.passwordRequired'),
    passwordPattern: marker('updatePassword.passwordPattern'),
    passwordPatternError: marker('updatePassword.passwordPatternError'),
    passwordMatch: marker('updatePassword.passwordMatch')
  };

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private userservice: UserService,
    private translate: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {}

  // Convenience getter for easy access to form fields
  get form() {
    return this.updatePasswordForm.controls;
  }

  ngOnInit(): void {
    this.userName = sessionStorage.getItem('userName');
    this.initializeForm();
  }

  public saveNewPassword(): void {
    this.userservice.updatePassByUser({ hash: '', ...this.updatePasswordForm.value }).subscribe({
      next: (response) => {
        this.updatePasswordSuccessfully();
      },
      error: (error) => {
        this.updatePasswordError(error);
      }
    });
  }

  private initializeForm(): void {
    this.updatePasswordForm = this.fb.group(
      {
        userName: [this.userName, Validators.required],
        pass: ['', [Validators.required, Validators.pattern(passwordPattern)]],
        passConfirmation: ['', Validators.required]
      },
      {
        validators: ConfirmPasswordValidator.mustMatch('pass', 'passConfirmation')
      }
    );
  }

  private updatePasswordSuccessfully(): void {
    this.globalMessageService.showSuccess({
      message: this.translate.instant(marker('login.restorePassword.changedSuccesfully')),
      actionText: this.translate.instant(marker('common.close')),
      duration: 3000
    });

    this.router.navigate(['/', RouteConstants.DASHBOARD]);
  }

  private updatePasswordError(error: ConcenetError): void {
    this.globalMessageService.showError({
      message: error.message,
      actionText: this.translate.instant(marker('common.close'))
    });
  }
}
