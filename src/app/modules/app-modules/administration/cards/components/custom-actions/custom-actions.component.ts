import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { actionsTabItems } from '@app/constants/actionsTabItems.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';
import { removeItemInFormArray } from '@shared/utils/removeItemInFormArray';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-custom-actions',
  templateUrl: './custom-actions.component.html',
  styleUrls: ['./custom-actions.component.scss']
})
export class CustomActionsComponent implements OnInit {
  @Input() formCol: UntypedFormGroup;
  @Input() colEdit: CardColumnDTO;
  public labels = {
    name: marker('common.name'),
    nameColumn: marker('cards.column.columnName'),
    nameRequired: marker('userProfile.nameRequired'),
    actionConfiguration: marker('cards.column.actionConfiguration'),
    shortcutConfiguration: marker('cards.column.shortcutConfiguration'),
    nameLink: marker('cards.column.linkName'),
    newLink: marker('cards.column.newLink'),
    tabSign: marker('common.actionsTabItems.sign'),
    tabMerssage: marker('common.actionsTabItems.message'),
    tabAttachment: marker('common.actionsTabItems.attachment'),
    tabStartConv: marker('common.actionsTabItems.startConversation'),
    shortcut: marker('common.shortcut'),
    actions: marker('common.actions')
  };
  public actionsTabItems = actionsTabItems;
  constructor(
    private fb: UntypedFormBuilder,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService
  ) {}
  get form() {
    return this.formCol.controls;
  }
  get tabs(): UntypedFormArray {
    return this.formCol.get('tabs') as UntypedFormArray;
  }
  get tabItems() {
    const tabsArray = this.formCol.controls.tabs as UntypedFormArray;
    return tabsArray.at(0).get('tabItems') as UntypedFormArray;
  }
  public deleteTab(tabItem: UntypedFormGroup) {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.column.deleteLinkConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          removeItemInFormArray(this.tabItems, tabItem.value.orderNumber - 1);
        }
      });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(this.tabItems, event.previousIndex, event.currentIndex);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dropLink(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(this.tabItems, event.previousIndex + 3, event.currentIndex + 3);
  }
  public showTabAction(tabItem: UntypedFormGroup) {
    const visible = tabItem.get('tabItemConfigAction').get('visible');
    visible.setValue(!visible.value);
  }
  public showTabLink(tabItem: UntypedFormGroup) {
    const visible = tabItem.get('tabItemConfigLink').get('visible');
    visible.setValue(!visible.value);
  }
  public newTab(tab?: CardColumnTabDTO): UntypedFormGroup {
    return this.fb.group({
      id: [tab ? tab.id : null],
      colId: [this.colEdit ? this.colEdit.id : null],
      orderNumber: [tab ? tab.orderNumber : this.tabs.length + 1, [Validators.required]],
      name: [tab ? tab.name : this.translateService.instant(this.labels.actions), [Validators.required]],
      type: [tab ? tab.type : 'CUSTOMIZABLE', [Validators.required]],
      contentTypeId: [tab ? tab.contentTypeId : 3, [Validators.required]],
      contentSourceId: [tab ? tab.contentSourceId : null],
      tabItems: this.generateTabItems(tab)
    });
  }
  public generateTabItems(tab?: CardColumnTabDTO): UntypedFormArray {
    const arrayForm = this.fb.array([]);
    if (tab) {
      tab.tabItems.forEach((tabItem) => {
        if (tabItem.typeItem === 'ACTION') {
          arrayForm.push(
            this.fb.group({
              id: [tabItem.id],
              tabId: [tab.id],
              typeItem: [tabItem.typeItem],
              orderNumber: [tabItem.orderNumber, [Validators.required]],
              name: [tabItem.name, [Validators.required]],
              tabItemConfigAction: this.fb.group({
                id: [tabItem.tabItemConfigAction.id],
                tabItemId: [tabItem.tabItemConfigAction.tabItemId],
                actionType: [tabItem.tabItemConfigAction.actionType],
                visible: [tabItem.tabItemConfigAction.visible]
              })
            })
          );
        } else if (tabItem.typeItem === 'LINK') {
          arrayForm.push(
            this.fb.group({
              id: [tabItem.id],
              tabId: [tab.id],
              typeItem: [tabItem.typeItem],
              orderNumber: [tabItem.orderNumber, [Validators.required]],
              name: [tabItem.name, [Validators.required]],
              tabItemConfigLink: this.fb.group({
                id: [tabItem.tabItemConfigLink.id],
                tabItemId: [tabItem.tabItemConfigLink.tabItemId],
                link: [tabItem.tabItemConfigLink.link, [Validators.required]],
                color: [tabItem.tabItemConfigLink.color, [Validators.required]]
              })
            })
          );
        }
      });
      actionsTabItems.forEach((tabItem, index) => {
        let tabItemSetted = false;
        tab.tabItems.forEach((tabItemAux) => {
          if (tabItemAux.typeItem === 'ACTION' && tabItemAux.tabItemConfigAction.actionType === tabItem.actionType) {
            tabItemSetted = true;
          }
        });
        if (!tabItemSetted) {
          arrayForm.push(
            this.fb.group({
              id: [null],
              tabId: [null],
              typeItem: ['ACTION'],
              orderNumber: [arrayForm.length, [Validators.required]],
              name: [this.translateService.instant(tabItem.name), [Validators.required]],
              tabItemConfigAction: this.fb.group({
                id: [null],
                tabItemId: [null],
                actionType: [tabItem.actionType],
                visible: [true]
              })
            })
          );
          moveItemInFormArray(arrayForm, arrayForm.length - 1, index);
        }
      });
    } else {
      actionsTabItems.forEach((tabItem, index) => {
        arrayForm.push(
          this.fb.group({
            id: [null],
            tabId: [null],
            typeItem: ['ACTION'],
            orderNumber: [index + 1, [Validators.required]],
            name: [this.translateService.instant(tabItem.name), [Validators.required]],
            tabItemConfigAction: this.fb.group({
              id: [null],
              tabItemId: [null],
              actionType: [tabItem.actionType],
              visible: [true]
            })
          })
        );
      });
    }
    return arrayForm;
  }
  public newTabItemLink() {
    this.tabItems.push(
      this.fb.group({
        id: [null],
        tabId: [null],
        typeItem: ['LINK'],
        orderNumber: [this.tabItems.length + 1, [Validators.required]],
        name: [this.translateService.instant(this.labels.nameLink), [Validators.required]],
        tabItemConfigLink: this.fb.group({
          id: [null],
          tabItemId: [null],
          link: ['', [Validators.required]],
          color: ['#FFFFFF']
        })
      })
    );
  }
  ngOnInit(): void {
    if (this.colEdit) {
      this.colEdit.tabs.forEach((tab) => {
        this.tabs.push(this.newTab(tab));
      });
    } else {
      this.tabs.push(this.newTab());
    }
  }
}
