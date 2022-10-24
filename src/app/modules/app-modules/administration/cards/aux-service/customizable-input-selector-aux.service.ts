import { Injectable } from '@angular/core';
import { ComponentToExtendForCustomDialog, CustomDialogService } from '@jenga/custom-dialog';
import { Observable } from 'rxjs';
import { ComponentType } from '@angular/cdk/portal';

export const enum CustomizableInputSelectorModalEnum {
  ID = 'my-profile-dialog-id',
  PANEL_CLASS = 'my-profile-dialog',
  TITLE = 'userProfile.edit'
}

@Injectable({
  providedIn: 'root'
})
export class CustomizableInputSelectorAuxService {
  constructor(private customDialogService: CustomDialogService) {}

  public openCustomizableInputModal(
    type: 'TITLE' | 'TEXT' | 'INPUT' | 'LIST' | 'TABLE' | 'OPTION' | 'VARIABLE' | 'LINK' | 'ACTION'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Observable<any> {
    const component: ComponentType<ComponentToExtendForCustomDialog> = null;
    switch (type) {
      case 'TITLE':
        break;
      case 'TEXT':
        break;
      case 'INPUT':
        break;
      case 'LIST':
        break;
      case 'TABLE':
        break;
      case 'OPTION':
        break;
      case 'VARIABLE':
        break;
      case 'LINK':
        break;
      case 'ACTION':
        break;
    }
    return this.customDialogService.open({
      component,
      extendedComponentData: type,
      id: CustomizableInputSelectorModalEnum.ID,
      panelClass: CustomizableInputSelectorModalEnum.PANEL_CLASS,
      disableClose: true,
      width: '700px'
    });
  }
}
