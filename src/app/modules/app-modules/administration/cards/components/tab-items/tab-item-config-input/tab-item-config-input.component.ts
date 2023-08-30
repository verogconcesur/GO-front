/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabItemDTO, { InputDataTypes, InputDateTypes } from '@data/models/cards/card-column-tab-item-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';

export const enum TabItemConfigInputComponentModalEnum {
  ID = 'config-input-dialog-id',
  PANEL_CLASS = 'config-input-dialog',
  TITLE = 'common.customTabItem.INPUT'
}

@Component({
  selector: 'app-tab-item-config-input',
  templateUrl: './tab-item-config-input.component.html',
  styleUrls: ['./tab-item-config-input.component.scss']
})
export class TabItemConfigInputComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker(TabItemConfigInputComponentModalEnum.TITLE),
    name: marker('common.name'),
    minLength: marker('errors.minLength'),
    nameRequired: marker('userProfile.nameRequired'),
    required: marker('errors.required'),
    dataTypeString: marker('cards.column.dataType.string'),
    dataTypeNumber: marker('cards.column.dataType.number'),
    dataTypeTemporal: marker('cards.column.dataType.temporal'),
    dateTypeDateTime: marker('cards.column.dateType.datetime'),
    dateTypeDate: marker('cards.column.dateType.date'),
    dateTypeTime: marker('cards.column.dateType.time'),
    dataType: marker('cards.column.dataTypeLabel'),
    dateType: marker('cards.column.dateTypeLabel'),
    dateApplyColor: marker('cards.column.dateApplyColor'),
    dateColor: marker('cards.column.dateColor'),
    dateLimit: marker('cards.column.dateLimit'),
    mandatory: marker('cards.column.mandatory'),
    numDecimals: marker('cards.column.numDecimals')
  };

  public minLength = 3;
  public tabItemForm: UntypedFormGroup;
  public tabItemToEdit: CardColumnTabItemDTO;
  public inputDataTypes = InputDataTypes;
  public inputDateTypes = InputDateTypes;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {
    super(
      TabItemConfigInputComponentModalEnum.ID,
      TabItemConfigInputComponentModalEnum.PANEL_CLASS,
      marker(TabItemConfigInputComponentModalEnum.TITLE)
    );
  }
  get tabItemConfigInput(): FormGroup {
    return this.tabItemForm.get('tabItemConfigInput') as FormGroup;
  }

  ngOnInit(): void {
    this.tabItemToEdit = this.extendedComponentData.tab;
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
  public changeDataType(firstLoad?: boolean): void {
    if (!firstLoad) {
      this.tabItemConfigInput.get('dateApplyColor').setValue(false);
      this.tabItemConfigInput.get('dateLimit').setValue(null);
      this.tabItemConfigInput.get('dateType').setValue(null);
      this.tabItemConfigInput.get('dateColor').setValue('#FFFFFF');
      this.tabItemConfigInput.get('numDecimals').setValue(0);
      this.tabItemConfigInput.get('dateType').setValidators([]);
      this.tabItemConfigInput.get('numDecimals').setValidators([]);
    }
    const dataType = this.tabItemConfigInput.get('dataType').value;
    switch (dataType) {
      case 'NUMBER':
        this.tabItemConfigInput.get('numDecimals').setValidators([Validators.required]);
        break;
      case 'TEMPORAL':
        this.tabItemConfigInput.get('dateType').setValidators([Validators.required]);
        break;
    }
  }
  private initializeForm = (): void => {
    this.tabItemForm = this.fb.group({
      id: [this.tabItemToEdit.id ? this.tabItemToEdit.id : null],
      typeItem: [this.tabItemToEdit.typeItem ? this.tabItemToEdit.typeItem : '', [Validators.required]],
      name: [this.tabItemToEdit.name ? this.tabItemToEdit.name : '', [Validators.required, Validators.minLength(this.minLength)]],
      description: [this.tabItemToEdit.description ? this.tabItemToEdit.description : null],
      tabId: [this.tabItemToEdit.tabId ? this.tabItemToEdit.tabId : null],
      orderNumber: [this.tabItemToEdit.orderNumber ? this.tabItemToEdit.orderNumber : null],
      tabItemConfigInput: this.fb.group({
        id: [this.tabItemToEdit?.tabItemConfigInput?.id ? this.tabItemToEdit.tabItemConfigInput.id : null],
        tabItemId: [this.tabItemToEdit?.tabItemConfigInput?.tabItemId ? this.tabItemToEdit.tabItemConfigInput.tabItemId : null],
        description: [
          this.tabItemToEdit?.tabItemConfigInput?.description ? this.tabItemToEdit.tabItemConfigInput.description : null
        ],
        dataType: [
          this.tabItemToEdit?.tabItemConfigInput?.dataType ? this.tabItemToEdit.tabItemConfigInput.dataType : null,
          [Validators.required]
        ],
        dateApplyColor: [this.tabItemToEdit?.tabItemConfigInput?.dateApplyColor ? true : false],
        dateColor: [
          this.tabItemToEdit?.tabItemConfigInput?.dateColor ? this.tabItemToEdit.tabItemConfigInput.dateColor : '#FFFFFF'
        ],
        dateLimit: [this.tabItemToEdit?.tabItemConfigInput?.dateLimit ? true : false],
        dateType: [this.tabItemToEdit?.tabItemConfigInput?.dateType ? this.tabItemToEdit.tabItemConfigInput.dateType : null],
        mandatory: [this.tabItemToEdit?.tabItemConfigInput?.mandatory ? this.tabItemToEdit.tabItemConfigInput.mandatory : false],
        numDecimals: [this.tabItemToEdit?.tabItemConfigInput?.numDecimals ? this.tabItemToEdit.tabItemConfigInput.numDecimals : 0]
      })
    });
  };
}
