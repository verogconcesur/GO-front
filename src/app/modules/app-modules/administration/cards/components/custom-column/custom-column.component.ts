import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tabTypes } from '@app/constants/tabTypes.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { TranslateService } from '@ngx-translate/core';
import { CardService } from '@data/services/card.service';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';
import CardContentTypeDTO from '@data/models/cards/card-content-type-dto';
import CardContentSourceDTO from '@data/models/cards/card-content-source-dto';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';
import { removeItemInFormArray } from '@shared/utils/removeItemInFormArray';

@Component({
  selector: 'app-custom-column',
  templateUrl: './custom-column.component.html',
  styleUrls: ['./custom-column.component.scss']
})
export class CustomColumnComponent implements OnInit {
  @Input() formCol: FormGroup;
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
    information: marker('cards.column.information'),
    tabCustomizable: marker('common.tabTypes.customizable'),
    tabTemplate: marker('common.tabTypes.template'),
    tabPrefixed: marker('common.tabTypes.prefixed'),
    required: marker('errors.required')
  };
  public formTab: FormGroup;
  public tabTypeList = tabTypes;
  public tabContentTypeList: CardContentTypeDTO[] = [];
  public tabContentSourceList: CardContentSourceDTO[] = [];
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public drop(event: CdkDragDrop<any>) {
    moveItemInFormArray(this.tabs, event.previousContainer.data.index, event.container.data.index);
  }
  public deleteTab(tab: FormGroup) {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.column.deleteTabConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          if(this.formTab && this.formTab.value.orderNumber === tab.value.orderNumber){
            this.formTab = null;
          }
          removeItemInFormArray(this.tabs, tab.value.orderNumber -1);
        }
      });
    }
  public isTabSelected(tab: FormGroup): boolean {
    return this.formTab && this.formTab.value && tab.value.orderNumber === this.formTab.value.orderNumber;
  }
  public addTab(): void {
    this.tabs.push(this.newTab());
  }
  public selectTab(tab: FormGroup): void {
    if (!this.formTab || this.formTab.value.orderNumber !== tab.value.orderNumber) {
      this.formTab = tab;
      this.getContentTypes(true);
      this.getContentSources(true);
    }
  }
  public newTab(tab?: CardColumnTabDTO): FormGroup {
    return this.fb.group({
      id: [tab ? tab.id : null],
      colId: [this.colEdit ? this.colEdit.id : null],
      orderNumber: [tab ? tab.orderNumber : this.tabs.length + 1, [Validators.required]],
      name: [tab ? tab.name : this.translateService.instant(this.labels.newTab) + (this.tabs.length + 1), [Validators.required]],
      type: [tab ? tab.type : null, [Validators.required]],
      contentTypeId: [tab ? tab.contentTypeId : null, [Validators.required]],
      contentSourceId: [tab ? tab.contentSourceId : null],
      tabItems: this.fb.array([])
    });
  }
  public getContentTypes(firstLoad?: boolean) {
    if (firstLoad) {
      this.tabContentTypeList = [];
    } else {
      this.formTab.get('contentTypeId').setValue(null);
      this.formTab.get('contentSourceId').setValue(null);
      this.tabContentSourceList = [];
    }
    if (this.formTab && this.formTab.value.type) {
      this.cardService.getContentTypes(this.formTab.value.type).subscribe((res) => {
        this.tabContentTypeList = res;
      });
    }
  }
  public getContentSources(firstLoad?: boolean) {
    if (firstLoad) {
      this.tabContentSourceList = [];
    } else {
      this.formTab.get('contentSourceId').setValue(null);
    }
    if (this.formTab && this.formTab.value.contentTypeId) {
      this.cardService.getContentSources(this.formTab.value.contentTypeId).subscribe((res) => {
        this.tabContentSourceList = res;
      });
    }
  }
  ngOnInit(): void {
    if (this.colEdit) {
      this.colEdit.tabs.forEach((tab) => {
        this.tabs.push(this.newTab(tab));
      });
    }
  }
}
