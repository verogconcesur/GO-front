import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipInput, MatChipInputEvent } from '@angular/material/chips';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AdvancedSearchItem } from '@data/models/adv-search/adv-search-dto';
import AdvSearchOperatorDTO from '@data/models/adv-search/adv-search-operator-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import moment from 'moment';
import { Observable, of } from 'rxjs';

export const enum AdvSearchCriteriaEditionDialogComponentModalEnum {
  ID = 'adv-search-criteria-edition-dialog-id',
  PANEL_CLASS = 'adv-search-criteria-edition-dialog',
  TITLE = 'common.advSearch.criteriaEdition'
}

@Component({
  selector: 'app-adv-search-criteria-edition-dialog',
  templateUrl: './adv-search-criteria-edition-dialog.component.html',
  styleUrls: ['./adv-search-criteria-edition-dialog.component.scss']
})
export class AdvSearchCriteriaEditionDialogComponent extends ComponentToExtendForCustomDialog implements OnInit {
  @ViewChild('pickerIniInput') pickerIniInput: ElementRef<HTMLInputElement>;
  public criteriaFormGroup: FormGroup;
  public readonly separatorKeysCodes = [ENTER, COMMA] as const;
  // public addOnBlur = true;
  // public fruits: Fruit[] = [{ name: 'Lemon' }, { name: 'Lime' }, { name: 'Apple' }];
  public operatorFormControl: FormControl = new FormControl(null);
  public valueFormControl: FormControl = new FormControl(null);
  public valueFormControl2: FormControl = new FormControl(null);
  public valueTimeChipsFormControl: FormControl = new FormControl(null);
  public labels = {
    operator: marker('advSearch.operator'),
    tString: marker('advSearch.criteria.typeString'),
    tDate: marker('advSearch.criteria.typeDate'),
    tDateFrom: marker('advSearch.criteria.typeDateFrom'),
    tDateTo: marker('advSearch.criteria.typeDateTo'),
    tDateTime: marker('advSearch.criteria.typeDateTime'),
    tDateTimeFrom: marker('advSearch.criteria.typeDateTimeFrom'),
    tDateTimeTo: marker('advSearch.criteria.typeDateTimeTo'),
    tTime: marker('advSearch.criteria.typeTime'),
    tTimeFrom: marker('advSearch.criteria.typeTimeFrom'),
    tTimeTo: marker('advSearch.criteria.typeTimeTo'),
    tEntity: marker('advSearch.criteria.typeEntity'),
    tNumber: marker('advSearch.criteria.typeNumber'),
    tNumberFrom: marker('advSearch.criteria.typeNumberFrom'),
    tNumberTo: marker('advSearch.criteria.typeNumberTo'),
    tBoolean: marker('advSearch.criteria.typeBoolean'),
    tBooleanTrue: marker('advSearch.criteria.typeBooleanTrue'),
    tBooleanFalse: marker('advSearch.criteria.typeBooleanFalse'),
    insertStringChip: marker('advSearch.criteria.insertStringChip'),
    insertNumberChip: marker('advSearch.criteria.insertNumberChip'),
    insertDateChip: marker('advSearch.criteria.insertDateChip'),
    insertDateTimeChip: marker('advSearch.criteria.insertDateTimeChip'),
    insertTimeChip: marker('advSearch.criteria.insertNuTimeip'),
    addTimeChip: marker('advSearch.criteria.addTimeChip')
  };
  public dataType: string = null;
  public operators: AdvSearchOperatorDTO[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public valueOptions: any[] = [];

  constructor(private confirmDialogService: ConfirmDialogService, private translateService: TranslateService) {
    super(
      AdvSearchCriteriaEditionDialogComponentModalEnum.ID,
      AdvSearchCriteriaEditionDialogComponentModalEnum.PANEL_CLASS,
      marker('advSearch.criteria.edition.title')
    );
  }

  get criteria(): AdvancedSearchItem {
    return this.criteriaFormGroup.value;
  }

  get criteriaName(): string {
    let name = '';
    const criteria = this.criteria;
    if (criteria.tabItem) {
      name = criteria.tabItem.name;
    } else {
      name = criteria.variable.name;
    }
    return name;
  }

  get operatorCode(): string {
    return this.operatorFormControl?.value?.code ? this.operatorFormControl.value.code : null;
  }

  ngOnInit(): void {
    this.criteriaFormGroup = this.extendedComponentData.criteria;
    if (this.criteria.tabItem?.typeItem) {
      switch (this.criteria.tabItem?.typeItem) {
        case 'INPUT':
          this.dataType =
            this.criteria.tabItem.tabItemConfigInput.dataType === 'TEMPORAL'
              ? this.criteria.tabItem.tabItemConfigInput.dateType
              : this.criteria.tabItem.tabItemConfigInput.dataType;
          break;
        case 'OPTION':
          this.dataType = 'BOOLEAN';
          this.valueOptions = [
            { value: true, label: this.labels.tBooleanTrue },
            { value: false, label: this.labels.tBooleanFalse }
          ];
          break;
        case 'LIST':
          this.dataType = 'ENTITY';
          //Use code and name
          this.valueOptions = this.criteria.tabItem.tabItemConfigList.listItems.map((i) => ({ ...i, name: i.value }));
          break;
        case 'TITLE':
        case 'TEXT':
        case 'VARIABLE':
          this.dataType = 'STRING';
          break;
      }
    } else {
      this.dataType = this.criteria.variable.dataType;
      if (this.dataType === 'ENTITY' && this.criteria.variable.attributeName === 'role.name') {
        //Use code and name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.valueOptions = this.extendedComponentData.roles.map((rol: any) => ({ ...rol, code: rol.id }));
      }
    }
    this.operators = this.extendedComponentData.operators.filter(
      (op: AdvSearchOperatorDTO) => op.dataTypes.indexOf(this.dataType) >= 0
    );
  }

  public addChip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chips: any[] = Array.isArray(this.valueFormControl.value) ? this.valueFormControl.value : [];
    if (value && chips.indexOf(value) === -1) {
      chips.push(value);
    }
    this.valueFormControl.setValue(chips);
    // Clear the input value
    event.chipInput?.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addDateChip(event: any, mode = 'DATE'): void {
    let format = 'D/M/YYYY';
    if (mode === 'DATETIME') {
      format = 'D/M/YYYY HH:mm';
    } else if (mode === 'TIME') {
      format = 'HH:mm';
    }
    const value = moment(event.value).format(format);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chips: any[] = Array.isArray(this.valueFormControl.value) ? this.valueFormControl.value : [];
    if (value && chips.indexOf(value) === -1) {
      chips.push(value);
    }
    this.valueFormControl.setValue(chips);
    if (this.pickerIniInput?.nativeElement) {
      this.pickerIniInput.nativeElement.value = '';
    }
  }

  public addTimeChip(): void {
    this.addDateChip({ value: this.valueTimeChipsFormControl.value }, 'TIME');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeChip(opt: any): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chips: any[] = Array.isArray(this.valueFormControl.value) ? this.valueFormControl.value : [];
    const index = chips.indexOf(opt);
    if (index >= 0) {
      chips.splice(index, 1);
    }
    this.valueFormControl.setValue(chips);
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    return this.confirmDialogService.open({
      title: this.translateService.instant(marker('common.warning')),
      message: this.translateService.instant(marker('errors.ifContinueLosingChanges'))
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onSubmitCustomDialog(): Observable<any> {
    console.log(this.criteriaFormGroup, this.valueFormControl, this.valueFormControl2, this.operatorFormControl);
    return of(this.criteriaFormGroup);
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
          label: marker('common.confirm'),
          design: 'raised',
          color: 'primary'
        }
      ]
    };
  }
}
