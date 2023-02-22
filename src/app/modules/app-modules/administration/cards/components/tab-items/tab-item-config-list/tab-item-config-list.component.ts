import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabItemDTO, { InputSelectionTypes, TabItemConfigListItemDTO } from '@data/models/cards/card-column-tab-item-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
export const enum TabItemConfigListComponentModalEnum {
  ID = 'config-list-dialog-id',
  PANEL_CLASS = 'config-list-dialog',
  TITLE = 'common.customTabItem.TITLE'
}
@Component({
  selector: 'app-tab-item-config-list',
  templateUrl: './tab-item-config-list.component.html',
  styleUrls: ['./tab-item-config-list.component.scss']
})
export class TabItemConfigListComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker(TabItemConfigListComponentModalEnum.TITLE),
    name: marker('common.name'),
    minLength: marker('errors.minLength'),
    nameRequired: marker('userProfile.nameRequired'),
    required: marker('errors.required'),
    selectType: marker('cards.column.selectType'),
    mandatory: marker('cards.column.mandatory'),
    isChild: marker('cards.column.isChild'),
    parent: marker('cards.column.parent'),
    itemList: marker('cards.column.itemList'),
    parentValue: marker('cards.column.parentValue'),
    simple: marker('cards.column.select.simple'),
    multiple: marker('cards.column.select.multiple'),
    valueItem: marker('cards.column.valueItem'),
    addItem: marker('cards.column.addItem')
  };

  public minLength = 3;
  public tabItemForm: UntypedFormGroup;
  public tabItemToEdit: CardColumnTabItemDTO;
  public listOptions: CardColumnTabItemDTO[] = [];
  public parentSelected: CardColumnTabItemDTO;
  public inputSelectionTypes = InputSelectionTypes;
  constructor(
    private fb: UntypedFormBuilder,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService
  ) {
    super(
      TabItemConfigListComponentModalEnum.ID,
      TabItemConfigListComponentModalEnum.PANEL_CLASS,
      marker(TabItemConfigListComponentModalEnum.TITLE)
    );
  }
  get tabItemConfigList(): FormGroup {
    return this.tabItemForm.get('tabItemConfigList') as FormGroup;
  }
  get listItems(): FormArray {
    return this.tabItemForm.get('tabItemConfigList').get('listItems') as FormArray;
  }

  ngOnInit(): void {
    this.tabItemToEdit = this.extendedComponentData.tab;
    this.listOptions = this.extendedComponentData.listOptions.filter(
      (tab: CardColumnTabItemDTO) => tab.typeItem === 'LIST' && tab.orderNumber !== this.tabItemToEdit?.orderNumber
    );
    this.initializeForm();
  }
  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.tabItemForm.touched && this.tabItemForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<CardColumnTabItemDTO> {
    return of(this.tabItemForm.getRawValue() as CardColumnTabItemDTO);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.cancel'),
          design: 'flat'
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.tabItemForm.touched && this.tabItemForm.dirty && this.tabItemForm.valid)
        }
      ]
    };
  }
  public getParentOptions(): TabItemConfigListItemDTO[] {
    let listItems: TabItemConfigListItemDTO[] = [];
    if (this.tabItemConfigList.get('parentCode').value) {
      if (!this.parentSelected || this.parentSelected.tabItemConfigList.code !== this.tabItemConfigList.get('parentCode').value) {
        this.parentSelected = this.listOptions.find(
          (option: CardColumnTabItemDTO) => option.tabItemConfigList.code === this.tabItemConfigList.get('parentCode').value
        );
      }
      if (this.parentSelected) {
        listItems = this.parentSelected.tabItemConfigList.listItems ? this.parentSelected.tabItemConfigList.listItems : [];
      }
    }
    return listItems;
  }
  public isChildChange(checked: boolean): void {
    if (checked) {
      this.tabItemConfigList.get('parentCode').setValidators([Validators.required]);
      const items = this.listItems;
      for (let i = 0; i < items.length; i++) {
        items.at(i).get('parentCode').setValidators([Validators.required]);
      }
    } else {
      this.tabItemConfigList.get('parentCode').setValidators([]);
      this.tabItemConfigList.get('parentCode').setValue(null);
      const items = this.listItems;
      for (let i = 0; i < items.length; i++) {
        items.at(i).get('parentCode').setValidators([]);
        items.at(i).get('parentCode').setValue(null);
      }
    }
  }
  public removeListItem(index: number): void {
    this.listItems.removeAt(index);
    this.tabItemForm.markAsTouched();
    this.tabItemForm.markAsDirty();
  }
  public newListItem(): void {
    const isChild = this.tabItemConfigList.get('isChild').value;
    this.listItems.push(
      this.fb.group({
        id: [null],
        tabItemConfigListId: [this.tabItemConfigList.get('id').value ? this.tabItemConfigList.get('id').value : null],
        value: [null, [Validators.required]],
        code: [uuidv4(), [Validators.required]],
        parentCode: [null, isChild ? [Validators.required] : []]
      })
    );
  }
  public generateListItems(): FormArray {
    const listItems = this.fb.array([], [Validators.required]);
    if (this.tabItemToEdit?.tabItemConfigList?.listItems?.length) {
      const isChild = !!this.tabItemToEdit?.tabItemConfigList?.parentCode;
      this.tabItemToEdit.tabItemConfigList.listItems.forEach((item: TabItemConfigListItemDTO) => {
        listItems.push(
          this.fb.group({
            id: [item?.id ? item.id : null],
            tabItemConfigListId: [item?.tabItemConfigListId ? item.tabItemConfigListId : null],
            value: [item?.value ? item.value : null, [Validators.required]],
            code: [item?.code ? item.code : uuidv4(), [Validators.required]],
            parentCode: [item?.parentCode ? item.parentCode : null, isChild ? [Validators.required] : []]
          })
        );
      });
    }
    return listItems;
  }
  private initializeForm = (): void => {
    this.tabItemForm = this.fb.group({
      id: [this.tabItemToEdit?.id ? this.tabItemToEdit.id : null],
      typeItem: [this.tabItemToEdit?.typeItem ? this.tabItemToEdit.typeItem : '', [Validators.required]],
      name: [
        this.tabItemToEdit?.name ? this.tabItemToEdit.name : '',
        [Validators.required, Validators.minLength(this.minLength)]
      ],
      description: [this.tabItemToEdit?.description ? this.tabItemToEdit.description : null],
      tabId: [this.tabItemToEdit?.tabId ? this.tabItemToEdit.tabId : null],
      orderNumber: [this.tabItemToEdit?.orderNumber ? this.tabItemToEdit.orderNumber : null],
      tabItemConfigList: this.fb.group({
        id: [this.tabItemToEdit?.tabItemConfigList?.id ? this.tabItemToEdit.tabItemConfigList.id : null],
        tabItemId: [this.tabItemToEdit?.tabItemConfigList?.tabItemId ? this.tabItemToEdit.tabItemConfigList.tabItemId : null],
        description: [
          this.tabItemToEdit?.tabItemConfigList?.description ? this.tabItemToEdit.tabItemConfigList.description : null
        ],
        mandatory: [this.tabItemToEdit?.tabItemConfigList?.mandatory ? true : false],
        code: [
          this.tabItemToEdit?.tabItemConfigList?.code ? this.tabItemToEdit.tabItemConfigList.code : uuidv4(),
          [Validators.required]
        ],
        parentCode: [
          this.tabItemToEdit?.tabItemConfigList?.parentCode ? this.tabItemToEdit.tabItemConfigList.parentCode : null,
          this.tabItemToEdit?.tabItemConfigList?.parentCode ? [Validators.required] : []
        ],
        isChild: [this.tabItemToEdit?.tabItemConfigList?.parentCode ? true : false],
        selectionType: [
          this.tabItemToEdit?.tabItemConfigList?.selectionType ? this.tabItemToEdit.tabItemConfigList.selectionType : null,
          [Validators.required]
        ],
        listItems: this.generateListItems()
      })
    });
  };
}
