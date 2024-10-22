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
import { forEach } from 'lodash';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit {

  public updatePasswordForm: UntypedFormGroup;
  public userName: string = '';

  public labels = {
    title: 'Actualizar Contraseña',
    description: 'Debe reiniciar la contraseña porque es su primer inicio de sesión o porque han pasado 6 meses desde que puso una nueva contraseña.',
    userName: 'Usuario',
    password1: 'Nueva Contraseña',
    password2: 'Repite Nueva Contraseña',
    save: 'Guardar contraseña',
    passwordRequired: 'Es necessario indicar la nueva contrasña',
    passwordPattern: 'Es necessario repetir la nueva contrasña',
    passwordPatternError: 'No cumple con los requisitos de la contraseña',
    passwordMatch: 'Las contraseñas deben coincidir'
  }

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

  public saveNewPassword(): void {
    this.userservice
      .updatePassByUser({ hash: '', ...this.updatePasswordForm.value })
      .subscribe({
        next: (response) => {
          console.log('updatePass Correct ' + response.fullName);
          this.updatePasswordSuccessfully();
        },
        error: (error) => {
          console.log('updatePass error' + error);
          this.updatePasswordError(error);
        }
      });
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
