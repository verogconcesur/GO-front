import { Component, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { Observable, of } from 'rxjs';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';

export const enum MyProfileComponentModalEnum {
  ID = 'my-profile-dialog-id',
  PANEL_CLASS = 'my-profile-dialog',
  TITLE = 'user.myProfile.title'
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent extends ComponentForCustomDialog implements OnInit {
  public labels = {
    title: marker(MyProfileComponentModalEnum.TITLE)
  };

  public varShowTestButton = true;

  constructor() {
    super(MyProfileComponentModalEnum.ID, MyProfileComponentModalEnum.PANEL_CLASS, marker(MyProfileComponentModalEnum.TITLE));
  }

  ngOnInit(): void {
    // this.testHiddenAndDisabled();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    //TODO: DGDC confirmar que se puede cerrar la modal
    console.log('My profile confirmCloseCustomDialog');
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean> {
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
        // {
        //   type: 'custom',
        //   label: 'hide',
        //   color: 'warn',
        //   design: 'fab',
        //   clickFn: this.testHiddenAndDisabled,
        //   hiddenFn: this.hideTestButton
        // }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          // iconName: 'person',
          // iconPosition: 'start',
          design: 'raised',
          color: 'primary'
          // disabledFn: this.disableSaveButton
        }
      ]
    };
  }

  // public hideTestButton = (): boolean => !this.varShowTestButton;

  // public disableSaveButton = (): boolean => this.varShowTestButton;

  // public testHiddenAndDisabled = (): void => {
  //   this.varShowTestButton = false;
  //   setTimeout(() => {
  //     this.varShowTestButton = true;
  //   }, 5000);
  // };
}
