import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { actionsTabItems } from '@app/constants/actionsTabItems.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';

@Component({
  selector: 'app-custom-actions',
  templateUrl: './custom-actions.component.html',
  styleUrls: ['./custom-actions.component.scss']
})
export class CustomActionsComponent implements OnInit {
  @Input() formCol: FormGroup;
  @Input() colEdit: CardColumnDTO;
  public labels = {
    name: marker('cards.column.columnName'),
    nameRequired: marker('userProfile.nameRequired'),
    actionConfiguration: marker('cards.column.actionConfiguration'),
    shortcutConfiguration: marker('cards.column.shortcutConfiguration'),
    tabSign: marker('common.actionsTabItems.sign'),
    tabMerssage: marker('common.actionsTabItems.message'),
    tabAttachment: marker('common.actionsTabItems.attachment'),
    actions: marker('common.actions')
  };

  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService,
    private cardService: CardService,
    private confirmationDialog: ConfirmDialogService
  ) {}
  get form() {
    return this.formCol.controls;
  }
  get tabs(): FormArray {
    return this.formCol.get('tabs') as FormArray;
  }
  get tabItems() {
    const tabsArray = this.formCol.controls.tabs as FormArray;
    return tabsArray.at(0).get('tabItems') as FormArray;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(this.tabItems, event.previousIndex, event.currentIndex);
  }
  public showTab(tabItem: FormGroup) {
    const visible = tabItem.get('tabItemConfigAction').get('visible');
    visible.setValue(!visible.value);
  }
  public newTab(tab?: CardColumnTabDTO): FormGroup {
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
  public generateTabItems(tab?: CardColumnTabDTO): FormArray {
    const arrayForm = this.fb.array([]);
    if (tab) {
      tab.tabItems.forEach((tabItem) => {
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
