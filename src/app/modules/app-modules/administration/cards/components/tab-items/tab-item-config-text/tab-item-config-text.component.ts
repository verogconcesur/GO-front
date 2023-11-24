import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';

export const enum TabItemConfigTextComponentModalEnum {
  ID = 'config-text-dialog-id',
  PANEL_CLASS = 'config-text-dialog',
  TITLE = 'common.customTabItem.TEXT'
}
@Component({
  selector: 'app-tab-item-config-text',
  templateUrl: './tab-item-config-text.component.html',
  styleUrls: ['./tab-item-config-text.component.scss']
})
export class TabItemConfigTextComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker(TabItemConfigTextComponentModalEnum.TITLE),
    name: marker('common.name'),
    minLength: marker('errors.minLength'),
    nameRequired: marker('userProfile.nameRequired'),
    required: marker('errors.required'),
    paragraph: marker('common.paragraph')
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
      TabItemConfigTextComponentModalEnum.ID,
      TabItemConfigTextComponentModalEnum.PANEL_CLASS,
      marker(TabItemConfigTextComponentModalEnum.TITLE)
    );
  }
  get tabItemConfigText(): FormGroup {
    return this.tabItemForm.get('tabItemConfigText') as FormGroup;
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

  private initializeForm = (): void => {
    this.tabItemForm = this.fb.group({
      id: [this.tabItemToEdit.id ? this.tabItemToEdit.id : null],
      typeItem: [this.tabItemToEdit.typeItem ? this.tabItemToEdit.typeItem : '', [Validators.required]],
      name: [this.tabItemToEdit.name ? this.tabItemToEdit.name : '', [Validators.required, Validators.minLength(this.minLength)]],
      description: [this.tabItemToEdit.description ? this.tabItemToEdit.description : null],
      tabId: [this.tabItemToEdit.tabId ? this.tabItemToEdit.tabId : null],
      orderNumber: [this.tabItemToEdit.orderNumber ? this.tabItemToEdit.orderNumber : null],
      tabItemConfigText: this.fb.group({
        id: [this.tabItemToEdit?.tabItemConfigText?.id ? this.tabItemToEdit.tabItemConfigText.id : null],
        tabItemId: [this.tabItemToEdit?.tabItemConfigText?.tabItemId ? this.tabItemToEdit.tabItemConfigText.tabItemId : null],
        description: [
          this.tabItemToEdit?.tabItemConfigText?.description ? this.tabItemToEdit.tabItemConfigText.description : null
        ],
        value: [
          this.tabItemToEdit?.tabItemConfigText?.value ? this.tabItemToEdit.tabItemConfigText.value : '',
          [Validators.required]
        ]
      })
    });
  };
}
