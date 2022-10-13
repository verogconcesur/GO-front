import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { tabTypes } from '@app/constants/tabTypes.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { TranslateService } from '@ngx-translate/core';
import { CardService } from '@data/services/cards.service';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';
import CardContentTypeDTO from '@data/models/cards/card-content-type-dto';
import CardContentSourceDTO from '@data/models/cards/card-content-source-dto';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { map, take } from 'rxjs/operators';
import { removeItemInFormArray } from '@shared/utils/removeItemInFormArray';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';

@Component({
  selector: 'app-custom-column',
  templateUrl: './custom-column.component.html',
  styleUrls: ['./custom-column.component.scss']
})
export class CustomColumnComponent implements OnInit {
  @Input() formCol: UntypedFormGroup;
  @Input() colEdit: CardColumnDTO;
  public labels = {
    name: marker('cards.column.columnName'),
    newTab: marker('cards.column.newTab'),
    tabList: marker('cards.column.tabList'),
    nameRequired: marker('userProfile.nameRequired'),
    tabConfiguration: marker('cards.column.tabConfiguration'),
    nameTab: marker('cards.column.nameTab'),
    tabType: marker('cards.column.tabType'),
    tabContentType: marker('cards.column.contentType'),
    tabContentSource: marker('cards.column.contentSource'),
    template: marker('cards.column.template'),
    information: marker('cards.column.information'),
    tabCustomizable: marker('common.tabTypes.customizable'),
    tabTemplate: marker('common.tabTypes.template'),
    tabPrefixed: marker('common.tabTypes.prefixed'),
    required: marker('errors.required')
  };
  public formTab: UntypedFormGroup;
  public tabTypeList = tabTypes;
  public tabContentTypeList: CardContentTypeDTO[] = [];
  public tabContentSourceList: CardContentSourceDTO[] = [];
  public tabContentSlotsList: WorkflowCardSlotDTO[] = [];
  public tabTemplateList: TemplatesCommonDTO[] = [];
  public tabId: number = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public tabSlotsBackup: any = {};
  constructor(
    private fb: UntypedFormBuilder,
    private translateService: TranslateService,
    private cardService: CardService,
    private confirmationDialog: ConfirmDialogService
  ) {}
  get form() {
    return this.formCol.controls;
  }
  get tabs(): UntypedFormArray {
    return this.formCol.get('tabs') as UntypedFormArray;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public drop(event: CdkDragDrop<any>) {
    moveItemInFormArray(this.tabs, event.previousContainer.data.index, event.container.data.index);
  }
  public deleteTab(tab: UntypedFormGroup) {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.column.deleteTabConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          if (this.formTab && this.formTab.value.orderNumber === tab.value.orderNumber) {
            this.formTab = null;
          }
          removeItemInFormArray(this.tabs, tab.value.orderNumber - 1);
        }
      });
  }
  public isTabSelected(tab: UntypedFormGroup): boolean {
    return this.formTab && this.formTab.value && tab.value.orderNumber === this.formTab.value.orderNumber;
  }
  public addTab(): void {
    this.tabs.push(this.newTab());
  }
  public selectTab(tab: UntypedFormGroup): void {
    if (!this.formTab || this.formTab.value.orderNumber !== tab.value.orderNumber) {
      this.formTab = tab;
      this.getContentTypes(true);
      this.changeContentType(true);
      this.getTabSlots(true);
    }
  }
  public newTab = (tab?: CardColumnTabDTO): UntypedFormGroup => {
    this.tabId = tab ? tab.id : null;
    return this.fb.group({
      id: [tab ? tab.id : null],
      colId: [this.colEdit ? this.colEdit.id : null],
      orderNumber: [tab ? tab.orderNumber : this.tabs.length + 1, [Validators.required]],
      name: [tab ? tab.name : this.translateService.instant(this.labels.newTab) + (this.tabs.length + 1), [Validators.required]],
      type: [tab ? tab.type : null, [Validators.required]],
      contentTypeId: [tab ? tab.contentTypeId : null, [Validators.required]],
      contentSourceId: [tab ? tab.contentSourceId : null],
      tabItems: this.getTabItemsConfig(tab ? tab.tabItems : null),
      templateId: [tab ? tab.templateId : null]
    });
  };
  public getContentTypes(firstLoad?: boolean) {
    if (firstLoad) {
      this.tabContentTypeList = [];
    } else {
      this.formTab.get('contentTypeId').setValue(null);
      this.changeContentType();
    }
    if (this.formTab && this.formTab.value.type) {
      this.cardService.getContentTypes(this.formTab.value.type).subscribe((res) => {
        this.tabContentTypeList = res;
      });
    }
  }
  public getTabItemsConfig(tabItems?: CardColumnTabItemDTO[]): UntypedFormArray {
    const fa = this.fb.array([]);
    if (tabItems?.length) {
      if (tabItems[0].typeItem === 'VARIABLE') {
        tabItems.forEach((tab: CardColumnTabItemDTO, index: number) => {
          (fa as UntypedFormArray).push(
            this.newTabItemForm(
              tab.typeItem,
              {
                attributeName: tab.tabItemConfigVariable.variable.attributeName,
                name: tab.name,
                variableId: tab.tabItemConfigVariable.variable.id,
                visible: tab.tabItemConfigVariable.visible
              },
              index + 1
            )
          );
        });
      }
    }
    return fa;
  }
  public changeContentType(firstLoad?: boolean): void {
    if (!firstLoad) {
      this.formTab.get('templateId').setValue(null);
      this.formTab.get('contentSourceId').setValue(null);
    }
    this.tabContentSourceList = [];
    this.formTab.get('contentSourceId').setValidators(null);
    this.tabTemplateList = [];
    this.formTab.get('templateId').setValidators(null);
    if (this.formTab && this.formTab.value.contentTypeId) {
      switch (this.formTab.get('contentTypeId').value) {
        case 1:
          this.getContentSources();
          this.formTab.get('contentSourceId').setValidators([Validators.required]);
          break;
        case 2:
          this.getContentSources();
          this.formTab.get('contentSourceId').setValidators([Validators.required]);
          break;
        case 3:
          this.getContentSources();
          break;
        case 4:
          this.getTemplates('BUDGET');
          this.formTab.get('templateId').setValidators([Validators.required]);
          let tabItemsForm4 = this.formTab.get('tabItems') as FormArray;
          tabItemsForm4 = this.fb.array([]);
          break;
        case 5:
          this.getTemplates('ATTACHMENTS');
          this.formTab.get('templateId').setValidators([Validators.required]);
          let tabItemsForm5 = this.formTab.get('tabItems') as FormArray;
          tabItemsForm5 = this.fb.array([]);
          break;
      }
    }
  }
  public getContentSources() {
    if (this.formTab && this.formTab.value.contentTypeId) {
      this.cardService.getContentSources(this.formTab.value.contentTypeId).subscribe((res) => {
        this.tabContentSourceList = res;
      });
    }
  }
  public getTemplates(templateType: string) {
    if (this.formTab && this.formTab.value.contentTypeId) {
      this.cardService.listTemplates(templateType).subscribe((res) => {
        this.tabTemplateList = res;
      });
    }
  }
  public newTabItemForm = (
    type: 'TITLE' | 'TEXT' | 'INPUT' | 'LIST' | 'TABLE' | 'OPTION' | 'VARIABLE' | 'LINK' | 'ACTION',
    data?: {
      variableId?: number;
      attributeName?: string;
      name?: string;
      visible?: boolean;
    },
    orderNumber?: number
  ): UntypedFormGroup => {
    let formGroup: UntypedFormGroup = null;
    if (type === 'VARIABLE') {
      formGroup = this.fb.group({
        attributeName: [{ value: data ? data.attributeName : '', disabled: true }],
        name: [data ? data.name : '', Validators.required],
        orderNumber: [orderNumber, Validators.required],
        tabId: [this.tabId],
        tabItemConfigVariable: this.fb.group({
          visible: [data.visible],
          variable: this.fb.group({
            attributeName: [data ? data.attributeName : ''],
            id: [data.variableId]
          })
        }),
        typeItem: [type]
      });
    }
    return formGroup;
  };
  public getTabSlots = (firstLoad?: boolean) => {
    if (firstLoad) {
      this.tabContentSlotsList = [];
      if (
        this.formTab &&
        this.formTab.value.contentTypeId &&
        this.formTab.value.contentSourceId &&
        this.formTab.value.tabItems?.length
      ) {
        this.tabSlotsBackup[`${this.formTab.value.contentTypeId}-${this.formTab.value.contentSourceId}`] =
          this.formTab.value.tabItems;
      }
    } else if (
      (this.formTab && this.formTab.value.contentTypeId === 1) ||
      (this.formTab && this.formTab.value.contentTypeId === 2)
    ) {
      while ((this.formTab.get('tabItems') as UntypedFormArray).length !== 0) {
        (this.formTab.get('tabItems') as UntypedFormArray).removeAt(0);
      }
      if (this.tabSlotsBackup[`${this.formTab.value.contentTypeId}-${this.formTab.value.contentSourceId}`]?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.tabSlotsBackup[`${this.formTab.value.contentTypeId}-${this.formTab.value.contentSourceId}`].forEach((data: any) => {
          (this.formTab.get('tabItems') as UntypedFormArray).push(
            this.newTabItemForm(
              'VARIABLE',
              {
                attributeName: data.tabItemConfigVariable.variable.attributeName,
                name: data.name,
                variableId: data.tabItemConfigVariable.variable.id,
                visible: data.tabItemConfigVariable.visible
              },
              data.orderNumber
            )
          );
        });
      } else {
        this.cardService.getEntityAttributes(this.formTab.value.contentSourceId).subscribe((res: WorkflowCardSlotDTO[]) => {
          this.tabContentSlotsList = res;
          this.tabContentSlotsList?.forEach((line, index) => {
            (this.formTab.get('tabItems') as UntypedFormArray).push(
              this.newTabItemForm(
                'VARIABLE',
                { attributeName: line.attributeName, name: line.attributeName, variableId: line.id, visible: true },
                index + 1
              )
            );
          });
        });
      }
    }
  };

  ngOnInit(): void {
    if (this.colEdit) {
      this.colEdit.tabs.forEach((tab) => {
        this.tabs.push(this.newTab(tab));
      });
    }
  }
}
