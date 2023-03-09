import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import WorkflowCardTabitemInstanceDTO from '@data/models/workflows/workflow-card-tabitem-instance-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';
import moment from 'moment';

@Component({
  selector: 'app-workflow-column-customizable-custom',
  templateUrl: './workflow-column-customizable-custom.component.html',
  styleUrls: ['./workflow-column-customizable-custom.component.scss']
})
export class WorkflowColumnCustomizableCustomComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public labels = {
    cancel: marker('common.cancel'),
    edit: marker('common.edit'),
    save: marker('common.save')
  };
  public tabItems: CardColumnTabItemDTO[];
  public tabForm: FormArray;
  public editMode = false;
  constructor(
    private cardService: CardService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {}
  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      this.getData();
    }
  }
  public getForm(index: string) {
    return this.tabForm.get(index);
  }
  public initForm(): void {
    this.tabForm = this.fb.array([]);
    this.tabItems.forEach((tabItem: CardColumnTabItemDTO) => {
      let cardTabItemInstance = null;
      const validators = [];
      switch (tabItem.typeItem) {
        case 'TITLE':
          cardTabItemInstance = tabItem.tabItemConfigTitle.cardTabItemInstance;
          break;
        case 'TEXT':
          cardTabItemInstance = tabItem.tabItemConfigText.cardTabItemInstance;
          break;
        case 'INPUT':
          cardTabItemInstance = tabItem.tabItemConfigInput.cardTabItemInstance;
          if (
            tabItem.tabItemConfigInput.dataType === 'TEMPORAL' &&
            tabItem.tabItemConfigInput.dateType === 'DATE' &&
            cardTabItemInstance
          ) {
            cardTabItemInstance.value = cardTabItemInstance.value
              ? moment(cardTabItemInstance.value, 'DD/MM/YYYY').toDate()
              : null;
          }
          if (
            tabItem.tabItemConfigInput.dataType === 'TEMPORAL' &&
            tabItem.tabItemConfigInput.dateType === 'DATETIME' &&
            cardTabItemInstance
          ) {
            cardTabItemInstance.value = cardTabItemInstance.value ? moment(cardTabItemInstance.value, 'DD/MM/YYYY HH:mm') : null;
          }
          if (
            tabItem.tabItemConfigInput.dataType === 'TEMPORAL' &&
            tabItem.tabItemConfigInput.dateType === 'TIME' &&
            cardTabItemInstance
          ) {
            const dateStrings = (cardTabItemInstance.value as string).split(':');
            cardTabItemInstance.value = cardTabItemInstance.value
              ? moment().set('hours', Number(dateStrings[0])).set('minutes', Number(dateStrings[1]))
              : null;
          }
          if (tabItem.tabItemConfigInput.mandatory) {
            validators.push(Validators.required);
          }
          break;
        case 'LIST':
          cardTabItemInstance = tabItem.tabItemConfigList.cardTabItemInstance;
          if (tabItem.tabItemConfigList.mandatory) {
            validators.push(Validators.required);
          }
          if (cardTabItemInstance && cardTabItemInstance.value && tabItem.tabItemConfigList.selectionType === 'MULTIPLE') {
            cardTabItemInstance.value = JSON.parse(cardTabItemInstance.value as string);
          }
          break;
        case 'OPTION':
          cardTabItemInstance = tabItem.tabItemConfigOption.cardTabItemInstance;
          break;
      }
      this.tabForm.push(
        this.fb.group({
          id: [cardTabItemInstance ? cardTabItemInstance.id : null],
          tabItem: [cardTabItemInstance ? cardTabItemInstance.tabItem : tabItem],
          value: [cardTabItemInstance ? cardTabItemInstance.value : null, validators]
        })
      );
    });
  }
  public edit() {
    this.editMode = true;
  }
  public cancel() {
    this.editMode = false;
    this.setShowLoading.emit(true);
    setTimeout(() => {
      this.getData();
    }, 200);
  }
  public save() {
    this.editMode = false;
    this.setShowLoading.emit(true);
    let bodyItems = this.tabForm.getRawValue();
    bodyItems = bodyItems.filter((item: WorkflowCardTabitemInstanceDTO) => item.value);
    bodyItems = bodyItems.map((item: WorkflowCardTabitemInstanceDTO) => {
      if (item.tabItem.tabItemConfigInput && item.tabItem.tabItemConfigInput.dataType === 'TEMPORAL') {
        const date = moment(item.value);
        switch (item.tabItem.tabItemConfigInput.dateType) {
          case 'DATE':
            item.value = date.format('DD/MM/YYYY');
            break;
          case 'DATETIME':
            item.value = date.format('DD/MM/YYYY HH:mm');
            break;
          case 'TIME':
            if (date.isValid()) {
              item.value = date.format('HH:mm');
            }
            break;
        }
      }
      if (item.tabItem.tabItemConfigList && item.tabItem.tabItemConfigList.selectionType === 'MULTIPLE') {
        item.value = JSON.stringify(item.value);
      }
      return item;
    });
    this.cardService
      .setCustomTab(this.cardInstance.cardInstanceWorkflow.id, this.tab.id, bodyItems)
      .pipe(take(1))
      .subscribe(
        () => {
          this.getData();
        },
        (error: ConcenetError) => {
          this.setShowLoading.emit(false);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
  public getData(): void {
    //Cogemos el cardInstanceWorkflowId de la ruta
    if (this.route?.snapshot?.params?.idCard) {
      this.setShowLoading.emit(true);
      this.cardService
        .getCardTabData(parseInt(this.route?.snapshot?.params?.idCard, 10), this.tab.id)
        .pipe(take(1))
        .subscribe(
          (data: CardColumnTabItemDTO[]) => {
            this.tabItems = data;
            this.initForm();
            this.setShowLoading.emit(false);
          },
          (error: ConcenetError) => {
            this.setShowLoading.emit(false);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }
}
