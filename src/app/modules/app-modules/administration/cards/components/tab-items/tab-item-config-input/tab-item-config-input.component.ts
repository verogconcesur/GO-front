/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
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
    name: marker('userProfile.name'),
    minLength: marker('errors.minLength'),
    nameRequired: marker('userProfile.nameRequired')
  };

  public minLength = 3;
  public tabItemForm: UntypedFormGroup;
  public tabItemToEdit: CardColumnTabItemDTO;

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

  ngOnInit(): void {
    this.tabItemToEdit = this.extendedComponentData;
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

  private initializeForm = (): void => {
    this.tabItemForm = this.fb.group({
      id: [this.tabItemToEdit.id ? this.tabItemToEdit.id : null],
      typeItem: [this.tabItemToEdit.typeItem ? this.tabItemToEdit.typeItem : '', [Validators.required]],
      name: [this.tabItemToEdit.name ? this.tabItemToEdit.name : '', [Validators.required, Validators.minLength(this.minLength)]],
      description: [this.tabItemToEdit.description ? this.tabItemToEdit.description : null],
      tabId: [this.tabItemToEdit.tabId ? this.tabItemToEdit.tabId : null],
      orderNumber: [this.tabItemToEdit.orderNumber ? this.tabItemToEdit.orderNumber : null]
      // tabItemConfigInput: this.fb.group({
      //   id: [this.tabItemToEdit.tabItemConfigInput.id ? this.tabItemToEdit.tabItemConfigInput.id : null],
      //   tabItemId: [this.tabItemToEdit.tabItemConfigInput.tabItemId ? this.tabItemToEdit.tabItemConfigInput.tabItemId : null],
      //   description: [
      //     this.tabItemToEdit.tabItemConfigInput.description ? this.tabItemToEdit.tabItemConfigInput.description : null
      //   ],
      //   dataType: [
      //     this.tabItemToEdit.tabItemConfigInput.dataType ? this.tabItemToEdit.tabItemConfigInput.dataType : null,
      //     [Validators.required]
      //   ],
      //   dateApplyColor: [
      //     this.tabItemToEdit.tabItemConfigInput.dateApplyColor ? this.tabItemToEdit.tabItemConfigInput.dateApplyColor : null
      //   ],
      //   dateColor: [this.tabItemToEdit.tabItemConfigInput.dateColor ? this.tabItemToEdit.tabItemConfigInput.dateColor : null],
      //   dateLimit: [this.tabItemToEdit.tabItemConfigInput.dateLimit ? this.tabItemToEdit.tabItemConfigInput.dateLimit : null],
      //   dateType: [this.tabItemToEdit.tabItemConfigInput.dateType ? this.tabItemToEdit.tabItemConfigInput.dateType : null],
      //   mandatory: [this.tabItemToEdit.tabItemConfigInput.mandatory ? this.tabItemToEdit.tabItemConfigInput.mandatory : null],
      //   numDecimals: [
      //     this.tabItemToEdit.tabItemConfigInput.numDecimals ? this.tabItemToEdit.tabItemConfigInput.numDecimals : null
      //   ]
      // })
    });
  };
}
