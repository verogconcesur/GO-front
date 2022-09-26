import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { UserService } from '@data/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  public labels = {
    description: marker('login.recoverpassword.description'),
    restore: marker('login.recoverpassword.restore'),
    title: marker('login.recoverpassword.title'),
    userName: marker('login.recoverpassword.userName'),
    userNameRequired: marker('login.recoverpassword.userNameRequired')
  };

  public forgotPasswordForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private userService: UserService,
    private translate: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  public restorePassword(): void {
    const spinner = this.spinnerService.show();

    this.userService
      .restorePassword(this.forgotPasswordForm.value.userName)
      .pipe(
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe({
        next: () => {
          this.forgotPasswordForm.reset();

          this.router.navigate([RouteConstants.LOGIN]);

          this.globalMessageService.showSuccess({
            message: this.translate.instant(marker('login.recoverpassword.email')),
            actionText: this.translate.instant(marker('common.close')),
            duration: 3000
          });
        },
        error: () => {}
      });
  }

  private initializeForm(): void {
    this.forgotPasswordForm = this.fb.group({
      userName: ['', Validators.required]
    });
  }
}
