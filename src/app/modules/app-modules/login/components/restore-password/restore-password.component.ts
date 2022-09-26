import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDTO from '@data/models/user-permissions/user-dto';
import { UserService } from '@data/services/user.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import ConfirmPasswordValidator from '@shared/validators/confirm-password.validator';
import { finalize } from 'rxjs/operators';
import { passwordPattern } from '@app/constants/patterns.constants';

@UntilDestroy()
@Component({
  selector: 'app-restore-password',
  templateUrl: './restore-password.component.html',
  styleUrls: ['./restore-password.component.scss']
})
export class RestorePasswordComponent implements OnInit {
  public restorePasswordForm: UntypedFormGroup;
  public labels = {
    title: marker('login.restorePassword.title'),
    description: marker('login.restorePassword.description'),
    userName: marker('login.restorePassword.userName'),
    password1: marker('login.restorePassword.password1'),
    password2: marker('login.restorePassword.password2'),
    save: marker('login.restorePassword.save'),
    userNameRequired: marker('login.restorePassword.userNameRequired'),
    passwordRequired: marker('login.restorePassword.passwordRequired'),
    passwordPattern: marker('login.restorePassword.passwordPattern'),
    passwordPatternError: marker('login.restorePassword.passwordPatternError'),
    passwordMatch: marker('login.restorePassword.passwordMatch'),
    changedSuccesfully: marker('login.restorePassword.changedSuccesfully')
  };

  private hash = '';

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private translate: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService
  ) {}

  // Convenience getter for easy access to form fields
  get form() {
    return this.restorePasswordForm.controls;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getHashFromURL();
  }

  public saveNewPassword(): void {
    const spinner = this.spinnerService.show();

    this.userService
      .changePassword({ hash: this.hash, ...this.restorePasswordForm.value })
      .pipe(
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe({
        next: (response) => {
          this.changePasswordSuccessfully(response);
        },
        error: (error) => {
          this.changePasswordError(error);
        }
      });
  }

  private initializeForm(): void {
    this.restorePasswordForm = this.fb.group(
      {
        userName: ['', Validators.required],
        pass: ['', [Validators.required, Validators.pattern(passwordPattern)]],
        passConfirmation: ['', Validators.required]
      },
      {
        validators: ConfirmPasswordValidator.mustMatch('pass', 'passConfirmation')
      }
    );
  }

  private getHashFromURL(): void {
    this.route.queryParams.pipe(untilDestroyed(this)).subscribe((params) => {
      this.hash = params.hash;
    });
  }

  private changePasswordSuccessfully(loginData: UserDTO): void {
    this.globalMessageService.showSuccess({
      message: this.translate.instant(marker('login.restorePassword.changedSuccesfully')),
      actionText: this.translate.instant(marker('common.close')),
      duration: 3000
    });

    this.router.navigate([RouteConstants.LOGIN]);
  }

  private changePasswordError(error: ConcenetError): void {
    this.globalMessageService.showError({
      message: error.message,
      actionText: this.translate.instant(marker('common.close'))
    });
  }
}
