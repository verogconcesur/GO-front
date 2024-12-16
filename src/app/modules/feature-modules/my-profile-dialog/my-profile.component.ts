import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { UserService } from '@data/services/user.service';
import {
  ChooseDoblefactorComponent,
  ChooseDobleFactorOptionComponentModalEnum
} from '@modules/app-modules/login/components/choose-doublefactor-option/choose-doublefactor-option.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import ConfirmPasswordValidator from '@shared/validators/confirm-password.validator';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { InsertSignComponentModalEnum, ModalInsertSignComponent } from '../modal-insert-sign/modal-insert-sign.component';

export const enum MyProfileComponentModalEnum {
  ID = 'my-profile-dialog-id',
  PANEL_CLASS = 'my-profile-dialog',
  TITLE = 'userProfile.edit'
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker(MyProfileComponentModalEnum.TITLE),
    name: marker('userProfile.name'),
    firstName: marker('userProfile.firstName'),
    lastName: marker('userProfile.lastName2'),
    userName: marker('userProfile.userName'),
    email: marker('userProfile.email'),
    role: marker('userProfile.role'),
    nick: marker('userProfile.nick'),
    organization: marker('userProfile.organization'),
    edit: marker('userProfile.edit'),
    sign: marker('userProfile.sign'),
    data: marker('userProfile.data'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    nameRequired: marker('userProfile.nameRequired'),
    firstNameRequired: marker('userProfile.firstNameRequired'),
    password: marker('login.password'),
    password1: marker('login.restorePassword.password1'),
    password2: marker('login.restorePassword.password2'),
    passwordRequired: marker('login.restorePassword.passwordRequired'),
    passwordPattern: marker('login.restorePassword.passwordPattern'),
    passwordPatternError: marker('login.restorePassword.passwordPatternError'),
    passwordMatch: marker('login.restorePassword.passwordMatch')
  };

  public showPasswordFields = false;
  public showF2AButtonField = false;
  public profileForm: UntypedFormGroup;
  public userDetails: UserDetailsDTO = null;
  public fingerprint: string;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private customDialogService: CustomDialogService,
    private translateService: TranslateService,
    private userService: UserService,
    private globalMessageService: GlobalMessageService,
    private authenticationService: AuthenticationService
  ) {
    super(MyProfileComponentModalEnum.ID, MyProfileComponentModalEnum.PANEL_CLASS, marker(MyProfileComponentModalEnum.TITLE));
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.profileForm.controls;
  }

  ngOnInit() {
    this.userDetails = this.extendedComponentData;
    this.fingerprint = this.authenticationService.generateBrowserFingerprint();
    this.initializeForm();
  }

  public editSign(): void {
    this.customDialogService
      .open({
        component: ModalInsertSignComponent,
        id: InsertSignComponentModalEnum.ID,
        panelClass: InsertSignComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '500px'
      })
      .pipe(take(1))
      .subscribe((data) => {
        this.profileForm.get('signature').setValue(data.split('base64,')[1]);
        this.profileForm.get('signatureContentType').setValue(data.split(';base64,')[0].split('data:')[1]);
        this.profileForm.markAsDirty();
        this.profileForm.markAsTouched();
      });
  }
  public showF2AButton() {
    if (this.authenticationService.getDefaultMode2FA()) {
      this.showF2AButtonField = true;
    }
  }

  public getSignSrc(): string {
    const profile = this.profileForm.getRawValue();
    if (profile.signature && profile.signatureContentType) {
      return `data:${profile.signatureContentType};base64,${profile.signature}`;
    }
    return null;
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.profileForm.touched && this.profileForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onSubmitCustomDialog(): Observable<any> {
    const formValue = this.profileForm.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newData: any = {
      id: this.userDetails.id,
      name: formValue.name,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      currentPass: null,
      newPass: null,
      newPassConfirmation: null,
      signature: formValue.signature,
      signatureContentType: formValue.signatureContentType
    };
    if (
      this.showPasswordFields &&
      formValue.password !== formValue.newPassword &&
      formValue.newPassword === formValue.newPasswordConfirmation
    ) {
      //There are changes in password
      newData.currentPass = formValue.password;
      newData.newPass = formValue.newPassword;
      newData.newPassConfirmation = formValue.newPasswordConfirmation;
    }
    const spinner = this.spinnerService.show();
    return this.userService.editUserProfile(newData).pipe(
      map((response) => {
        this.userDetails = response;
        this.globalMessageService.showSuccess({
          message: this.translateService.instant(marker('common.successOperation')),
          actionText: this.translateService.instant(marker('common.close'))
        });
        return this.userDetails;
      }),
      catchError((error) => {
        this.globalMessageService.showError({
          message: error.message,
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
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.cancel'),
          design: 'flat'
        },
        {
          type: 'custom',
          label: marker('userProfile.changePassword'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.showPasswordFieldsAndSet,
          hiddenFn: () => this.showF2AButtonField
        },
        {
          type: 'custom',
          label: 'Cambiar opción F2A',
          design: 'stroked',
          color: 'warn',
          clickFn: this.openModalF2A,
          hiddenFn: () => this.showPasswordFields
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.profileForm.touched && this.profileForm.dirty && this.profileForm.valid)
        }
      ]
    };
  }

  public disableTooltip(value: string): boolean {
    if (value && value.length > 22) {
      return false;
    }
    return true;
  }

  public openModalF2A = () => {
    this.customDialogService
      .open({
        id: ChooseDobleFactorOptionComponentModalEnum.ID,
        panelClass: ChooseDobleFactorOptionComponentModalEnum.PANEL_CLASS,
        component: ChooseDoblefactorComponent,
        width: '700px',
        extendedComponentData: {
          id: this.userDetails.id,
          phoneNumber: this.userDetails.phoneNumber,
          email: this.userDetails.email,
          fingerprint: this.fingerprint
        }
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          console.log('entra');
          this.customDialogService.close(ChooseDobleFactorOptionComponentModalEnum.ID);
        }
      });
  };

  private showPasswordFieldsAndSet = () => {
    this.profileForm.get('password').setValue('');
    this.profileForm.get('newPassword').setValue('');
    this.profileForm.get('newPasswordConfirmation').setValue('');
    this.showPasswordFields = true;
  };

  private initializeForm(): void {
    this.profileForm = this.fb.group(
      {
        name: [this.userDetails.name, Validators.required],
        firstName: [this.userDetails.firstName],
        lastName: [this.userDetails.lastName],
        email: [this.userDetails.email],
        phoneNumber: [this.userDetails.phoneNumber],
        userName: [{ value: this.userDetails.userName, disabled: true }, Validators.required],
        role: [{ value: this.userDetails.role.name, disabled: true }, Validators.required],
        password: [this.userDetails.password, Validators.required],
        newPassword: [
          this.userDetails.password,
          [
            Validators.required,
            ConfirmPasswordValidator.validAndDiffToOriginal('newPassword', this.userDetails ? this.userDetails.password : null)
          ]
        ],
        newPasswordConfirmation: [this.userDetails.password, Validators.required],
        brands: [
          {
            value:
              this.userDetails.brands && Array.isArray(this.userDetails.brands)
                ? this.userDetails.brands.reduce((prev, curr) => (prev ? `${prev}, ${curr.name}` : curr.name), '')
                : '',
            disabled: true
          }
        ],
        facilities: [
          {
            value:
              this.userDetails.facilities && Array.isArray(this.userDetails.facilities)
                ? this.userDetails.facilities.reduce((prev, curr) => (prev ? `${prev}, ${curr.name}` : curr.name), '')
                : '',
            disabled: true
          }
        ],
        departments: [
          {
            value:
              this.userDetails.departments && Array.isArray(this.userDetails.departments)
                ? this.userDetails.departments.reduce((prev, curr) => (prev ? `${prev}, ${curr.name}` : curr.name), '')
                : '',
            disabled: true
          }
        ],
        specialties: [
          {
            value:
              this.userDetails.specialties && Array.isArray(this.userDetails.specialties)
                ? this.userDetails.specialties.reduce((prev, curr) => (prev ? `${prev}, ${curr.name}` : curr.name), '')
                : '',
            disabled: true
          }
        ],
        signature: [this.userDetails.signature ? this.userDetails.signature : null],
        signatureContentType: [this.userDetails.signatureContentType ? this.userDetails.signatureContentType : null]
      },
      {
        validators: ConfirmPasswordValidator.mustMatch('newPassword', 'newPasswordConfirmation')
      }
    );
  }
}
