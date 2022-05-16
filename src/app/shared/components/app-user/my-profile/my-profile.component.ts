import { Component, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { Observable, of } from 'rxjs';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import UserDTO from '@data/models/user-dto';
import UserDetailsDTO from '@data/models/user-details-dto';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import ConfirmPasswordValidator from '@shared/validators/confirm-password.validator';
import { passwordPattern } from '@app/constants/patterns.constants';

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
    password1: marker('login.restorePassword.password1'),
    password2: marker('login.restorePassword.password2'),
    passwordRequired: marker('login.restorePassword.passwordRequired'),
    passwordPattern: marker('login.restorePassword.passwordPattern'),
    passwordMatch: marker('login.restorePassword.passwordMatch')
  };

  public showPasswordFields = false;
  public profileForm: FormGroup;
  public userDetails: UserDetailsDTO = null;

  constructor(
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService
  ) {
    super(MyProfileComponentModalEnum.ID, MyProfileComponentModalEnum.PANEL_CLASS, marker(MyProfileComponentModalEnum.TITLE));
  }

  ngOnInit() {
    this.userDetails = this.extendedComponentData;
    this.initializeForm();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.profileForm.touched || this.profileForm.dirty) {
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
    //TODO: DGDC invocar función para guardar cambios
    console.log('My profile onSubmitCustomDialog - saving: ', { ...this.userDetails, ...this.profileForm.value });
    return of(true);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.cancel'),
          design: 'stroked'
        },
        {
          type: 'custom',
          label: marker('userProfile.changePassword'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.showPasswordFieldsAndSet,
          hiddenFn: () => this.showPasswordFields
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.profileForm.touched && this.profileForm.valid)
        }
      ]
    };
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.profileForm.controls;
  }

  public disableTooltip(value: string): boolean {
    if (value && value.length > 22) {
      return false;
    }
    return true;
  }

  private showPasswordFieldsAndSet = () => {
    this.profileForm.get('password').setValue('');
    this.profileForm.get('passwordConfirmation').setValue('');
    this.showPasswordFields = true;
  };

  private initializeForm(): void {
    this.profileForm = this.fb.group(
      {
        name: [this.userDetails.name, Validators.required],
        firstName: [this.userDetails.firstName],
        lastName: [this.userDetails.lastName],
        email: [{ value: this.userDetails.email, disabled: true }, Validators.required],
        userName: [{ value: this.userDetails.userName, disabled: true }, Validators.required],
        role: [{ value: this.userDetails.role.name, disabled: true }, Validators.required],
        password: [this.userDetails.password, [Validators.required, Validators.pattern(passwordPattern)]],
        passwordConfirmation: [this.userDetails.password, Validators.required],
        brands: [
          {
            value: this.userDetails.brands.reduce((prev, curr) => (prev ? `${prev}, ${curr.name}` : curr.name), ''),
            disabled: true
          }
        ],
        facilities: [
          {
            value: this.userDetails.facilities.reduce((prev, curr) => (prev ? `${prev}, ${curr.name}` : curr.name), ''),
            disabled: true
          }
        ],
        departments: [
          {
            value: this.userDetails.departments.reduce((prev, curr) => (prev ? `${prev}, ${curr.name}` : curr.name), ''),
            disabled: true
          }
        ],
        specialties: [
          {
            value: this.userDetails.specialties.reduce((prev, curr) => (prev ? `${prev}, ${curr.name}` : curr.name), ''),
            disabled: true
          }
        ]
        // firma: [null, Validators.required]
      },
      {
        validators: ConfirmPasswordValidator.mustMatch('password', 'passwordConfirmation')
      }
    );
  }
}
