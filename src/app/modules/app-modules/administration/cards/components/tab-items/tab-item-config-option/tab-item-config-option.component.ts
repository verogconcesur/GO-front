import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import PriorityDTO from '@data/models/cards/priority-dto';
import { CardService } from '@data/services/cards.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

export const enum TabItemConfigOptionComponentModalEnum {
  ID = 'config-option-dialog-id',
  PANEL_CLASS = 'config-option-dialog',
  TITLE = 'common.customTabItem.TITLE'
}
@Component({
  selector: 'app-tab-item-config-option',
  templateUrl: './tab-item-config-option.component.html',
  styleUrls: ['./tab-item-config-option.component.scss']
})
export class TabItemConfigOptionComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker(TabItemConfigOptionComponentModalEnum.TITLE),
    name: marker('common.name'),
    minLength: marker('errors.minLength'),
    nameRequired: marker('userProfile.nameRequired'),
    applyColor: marker('cards.column.applyColor'),
    color: marker('cards.column.color'),
    overridePriority: marker('cards.column.overridePriority'),
    priority: marker('cards.column.priority')
  };
  public minLength = 3;
  public tabItemForm: UntypedFormGroup;
  public tabItemToEdit: CardColumnTabItemDTO;
  // public priorities: PriorityDTO[];

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private cardService: CardService
  ) {
    super(
      TabItemConfigOptionComponentModalEnum.ID,
      TabItemConfigOptionComponentModalEnum.PANEL_CLASS,
      marker(TabItemConfigOptionComponentModalEnum.TITLE)
    );
  }
  get tabItemConfigOption(): FormGroup {
    return this.tabItemForm.get('tabItemConfigOption') as FormGroup;
  }

  ngOnInit(): void {
    this.tabItemToEdit = this.extendedComponentData;
    // const spinner = this.spinnerService.show();
    // this.cardService
    //   .getPriorirites()
    //   .pipe(take(1))
    //   .subscribe((res) => {
    //     this.priorities = res;
    //     this.initializeForm();
    //     this.spinnerService.hide(spinner);
    //   });
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
          disabledFn: () => !this.tabItemForm || !(this.tabItemForm.touched && this.tabItemForm.dirty && this.tabItemForm.valid)
        }
      ]
    };
  }
  public removePriority(): void {
    this.tabItemConfigOption.get('overridePriority').setValue(null);
  }
  public requiredConfigChange(checked: boolean, form: string): void {
    const validators = [];
    if (checked) {
      validators.push(Validators.required);
    }
    switch (form) {
      case 'applyColor':
        this.tabItemConfigOption.get('color').setValidators(validators);
        this.tabItemConfigOption.get('color').setValue(null);
        break;
      case 'overridePriority':
        this.tabItemConfigOption.get('priority').setValidators(validators);
        this.tabItemConfigOption.get('priority').setValue(null);
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
      tabItemConfigOption: this.fb.group({
        id: [this.tabItemToEdit?.tabItemConfigOption?.id ? this.tabItemToEdit.tabItemConfigOption.id : null],
        tabItemId: [this.tabItemToEdit?.tabItemConfigOption?.tabItemId ? this.tabItemToEdit.tabItemConfigOption.tabItemId : null],
        description: [
          this.tabItemToEdit?.tabItemConfigOption?.description ? this.tabItemToEdit.tabItemConfigOption.description : null
        ],
        applyColor: [this.tabItemToEdit?.tabItemConfigOption?.applyColor ? true : false],
        color: [
          this.tabItemToEdit?.tabItemConfigOption?.color ? this.tabItemToEdit.tabItemConfigOption.color : null,
          [this.tabItemToEdit?.tabItemConfigOption?.applyColor ? Validators.required : null]
        ]
        // overridePriority: [this.tabItemToEdit?.tabItemConfigOption?.overridePriority ? true : false],
        // priority: [
        //   this.tabItemToEdit?.tabItemConfigOption?.priority ? this.tabItemToEdit.tabItemConfigOption.priority : null,
        //   [this.tabItemToEdit?.tabItemConfigOption?.overridePriority ? Validators.required : null]
        // ]
      })
    });
  };
}
