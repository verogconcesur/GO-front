import { Component, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { Observable, of } from 'rxjs';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import UserDTO from '@data/models/user-dto';

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
    firstNameRequired: marker('userProfile.firstNameRequired')
  };

  public panelDataOpenState = true;
  public panelOrganizationOpenState = true;
  public panelSignOpenState = true;

  public profileForm: FormGroup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public userDetails: any = null;

  constructor(private fb: FormBuilder, private spinnerService: ProgressSpinnerDialogService) {
    super(MyProfileComponentModalEnum.ID, MyProfileComponentModalEnum.PANEL_CLASS, marker(MyProfileComponentModalEnum.TITLE));
  }

  ngOnInit() {
    this.userDetails = this.extendedComponentData;
    this.initializeForm();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    //TODO: DGDC confirmar que se puede cerrar la modal
    console.log('My profile confirmCloseCustomDialog');
    return of(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onSubmitCustomDialog(): Observable<any> {
    //TODO: DGDC realizar las acciones necesarias para confirmar cambios si los hay y cerrar modal
    console.log('My profile onSubmitCustomDialog');
    return of(true);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.cancel'),
          iconName: 'close',
          design: 'stroked'
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary'
        }
      ]
    };
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      id: [{ value: this.userDetails.id, disabled: true }, Validators.required],
      name: [this.userDetails.name, Validators.required],
      firstName: [this.userDetails.firstName, Validators.required],
      lastName: [this.userDetails.lastName],
      email: [{ value: this.userDetails.email, disabled: true }, Validators.required],
      userName: [{ value: this.userDetails.userName, disabled: true }, Validators.required],
      password: [this.userDetails.password, Validators.required],
      passwordConfirmation: [this.userDetails.password, Validators.required],
      role: [{ value: this.userDetails.role.name, disabled: true }, Validators.required],
      marcas: [{ value: this.userDetails.marcas, disabled: true }, Validators.required],
      instalaciones: [{ value: this.userDetails.instalaciones, disabled: true }, Validators.required],
      departamentos: [{ value: this.userDetails.departamentos, disabled: true }, Validators.required],
      especialidades: [{ value: this.userDetails.especialidades, disabled: true }, Validators.required],
      firma: [this.userDetails.firma, Validators.required]
    });
    console.log(this.userDetails, this.profileForm);
  }
}
