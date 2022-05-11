import { Component, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { Observable, of } from 'rxjs';

const enum MyProfileComponentModalEnum{
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

  constructor() {
    super(
      MyProfileComponentModalEnum.ID,
      MyProfileComponentModalEnum.PANEL_CLASS,
      marker(MyProfileComponentModalEnum.TITLE)
    );
  }

  ngOnInit(): void {
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    //TODO: DGDC confirmar que se puede cerrar la modal
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean> {
    //TODO: DGDC realizar las acciones necesarias para confirmar cambios si los hay y cerrar modal
    return of(true);
  }

}
