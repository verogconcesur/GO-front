import { Injectable } from '@angular/core';
import { ComponentToExtendForCustomDialog, CustomDialogService } from '@frontend/custom-dialog';
import { Observable } from 'rxjs';
import { ComponentType } from '@angular/cdk/portal';
import { TabItemConfigInputComponent } from '../components/tab-items/tab-item-config-input/tab-item-config-input.component';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import { TabItemConfigTextComponent } from '../components/tab-items/tab-item-config-text/tab-item-config-text.component';
import { TabItemConfigTitleComponent } from '../components/tab-items/tab-item-config-title/tab-item-config-title.component';
import { TabItemConfigListComponent } from '../components/tab-items/tab-item-config-list/tab-item-config-list.component';
import { TabItemConfigOptionComponent } from '../components/tab-items/tab-item-config-option/tab-item-config-option.component';

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
    tabItem: CardColumnTabItemDTO,
    listParentOptions?: CardColumnTabItemDTO[]
  ): Observable<CardColumnTabItemDTO> {
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
        component = TabItemConfigListComponent;
        break;
      case 'OPTION':
        component = TabItemConfigOptionComponent;
        break;
    }
    return this.customDialogService.open({
      component,
      extendedComponentData: { tab: tabItem, listOptions: listParentOptions ? listParentOptions : [] },
      id: CustomizableInputSelectorModalEnum.ID,
      panelClass: CustomizableInputSelectorModalEnum.PANEL_CLASS,
      disableClose: true,
      width: '900px'
    });
  }
}
