import { Injectable } from '@angular/core';
import { ComponentToExtendForCustomDialog, CustomDialogService } from '@jenga/custom-dialog';
import { Observable } from 'rxjs';
import { ComponentType } from '@angular/cdk/portal';
import { TabItemConfigInputComponent } from '../components/tab-items/tab-item-config-input/tab-item-config-input.component';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import { TabItemConfigTextComponent } from '../components/tab-items/tab-item-config-text/tab-item-config-text.component';
import { TabItemConfigTitleComponent } from '../components/tab-items/tab-item-config-title/tab-item-config-title.component';

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

  public openCustomizableInputModal(tabItem: CardColumnTabItemDTO): Observable<CardColumnTabItemDTO> {
    let component: ComponentType<ComponentToExtendForCustomDialog>;
    switch (tabItem.typeItem) {
      case 'TITLE':
        component = TabItemConfigTitleComponent;
        break;
      case 'TEXT':
        component = TabItemConfigTextComponent;
        break;
      case 'INPUT':
        component = TabItemConfigInputComponent;
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
      extendedComponentData: tabItem,
      id: CustomizableInputSelectorModalEnum.ID,
      panelClass: CustomizableInputSelectorModalEnum.PANEL_CLASS,
      disableClose: true,
      width: '700px'
    });
  }
}
