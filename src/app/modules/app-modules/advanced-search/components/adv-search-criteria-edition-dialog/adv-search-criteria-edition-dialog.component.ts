import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AdvancedSearchItem } from '@data/models/adv-search/adv-search-dto';
import AdvSearchOperatorDTO from '@data/models/adv-search/adv-search-operator-dto';
import { AdvSearchService } from '@data/services/adv-search.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import moment from 'moment';
import { BehaviorSubject, Observable, of, take } from 'rxjs';

export const enum AdvSearchCriteriaEditionDialogComponentModalEnum {
  ID = 'adv-search-criteria-edition-dialog-id',
  PANEL_CLASS = 'adv-search-criteria-edition-dialog',
  TITLE = 'common.advSearch.criteriaEdition'
}
@UntilDestroy()
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
    insertTimeChip: marker('advSearch.criteria.insertTimeChip'),
    addTimeChip: marker('advSearch.criteria.addTimeChip')
  };
  public dataType: string = null;
  public operators: AdvSearchOperatorDTO[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public valueOptions: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private advSearchService: AdvSearchService,
    private globalMessageService: GlobalMessageService
  ) {
    super(
      AdvSearchCriteriaEditionDialogComponentModalEnum.ID,
      AdvSearchCriteriaEditionDialogComponentModalEnum.PANEL_CLASS,
      marker('advSearch.criteria.edition.title')
    );
  }

  get criteria(): AdvancedSearchItem {
    return this.criteriaFormGroup?.value ?? null;
  }

  get criteriaName(): string {
    let name = '';
    const criteria = this.criteria;
    if (criteria?.tabItem) {
      name = criteria.tabItem.name;
    } else if (criteria?.variable) {
      name = criteria.variable.name;
    }
    return name;
  }

  get operatorCode(): string {
    return this.operatorFormControl?.value?.code ? this.operatorFormControl.value.code : null;
  }

  ngOnInit(): void {
    if (this.extendedComponentData.title) {
      this.MODAL_TITLE = this.extendedComponentData.title;
    }
    this.criteriaFormGroup = this.extendedComponentData.criteria;
    this.valueOptions.next(null);
    let settingValueOptions = false;
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
          this.valueOptions.next([
            { id: 'true', value: 'true', label: this.translateService.instant(this.labels.tBooleanTrue) },
            { id: 'false', value: 'false', label: this.translateService.instant(this.labels.tBooleanFalse) }
          ]);
          settingValueOptions = true;
          break;
        case 'LIST':
          this.dataType = 'ENTITY';
          //Use code and name
          this.valueOptions.next(this.criteria.tabItem.tabItemConfigList.listItems.map((i) => ({ ...i, name: i.value })));
          settingValueOptions = true;
          break;
        case 'TITLE':
        case 'TEXT':
        case 'VARIABLE':
          this.dataType = 'STRING';
          break;
      }
    } else {
      this.dataType = this.criteria.variable.dataType;
      if (this.dataType === 'ENTITY') {
        //Use code and name
        // get options with service && this.criteria.variable.attributeName === 'role.name'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.advSearchService
          .getOptionsListForEntity(this.criteria.variable.id)
          .pipe(take(1))
          .subscribe({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            next: (options: any[]) => {
              this.valueOptions.next(options.map((opt) => ({ ...opt, code: opt.id, name: opt.value })));
            },
            error: (err) => {
              this.globalMessageService.showError({
                message: err.message,
                actionText: this.translateService.instant(marker('common.close'))
              });
            }
          });
        settingValueOptions = true;
      }
    }
    this.operators = this.extendedComponentData.operators.filter((op: AdvSearchOperatorDTO) => {
      if (
        op.dataTypes.indexOf(this.dataType) >= 0 &&
        this.criteria &&
        this.criteria.tabItem?.typeItem === 'LIST' &&
        this.criteria.tabItem?.tabItemConfigList?.selectionType === 'MULTIPLE'
      ) {
        //Evitar EQ y NEQ puesto que no son múltiples
        return ['EQ', 'NEQ'].indexOf(op.code) === -1;
      } else if (
        op.dataTypes.indexOf(this.dataType) >= 0 &&
        this.criteria &&
        this.criteria.tabItem?.typeItem === 'LIST' &&
        this.criteria.tabItem?.tabItemConfigList?.selectionType === 'SIMPLE'
      ) {
        //Evitar IN y NIN puesto que no son simples
        return ['IN', 'NIN'].indexOf(op.code) === -1;
      }
      return op.dataTypes.indexOf(this.dataType) >= 0;
    });
    //Ya tengo valueOptions y operatos, inicializo los form.
    if (this.criteria?.advancedSearchOperator) {
      this.operatorFormControl.setValue(this.operators.find((op) => op.id === this.criteria.advancedSearchOperator.id));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = this.criteria.value;
      if (`${this.criteria.value}`?.indexOf(this.extendedComponentData.escapedValue) >= 0) {
        value = this.criteria.value.split(this.extendedComponentData.escapedValue);
      } else if (this.criteria.advancedSearchOperator.code === 'IN' || this.criteria.advancedSearchOperator.code === 'NIN') {
        value = [value];
      }
      if (this.criteria.advancedSearchOperator.code === 'BET') {
        this.valueFormControl.setValue(this.getValueOrDate(value[0], true));
        this.valueFormControl2.setValue(this.getValueOrDate(value[1], true));
      } else if (
        settingValueOptions &&
        (this.criteria.advancedSearchOperator.code === 'IN' || this.criteria.advancedSearchOperator.code === 'NIN')
      ) {
        value = Array.isArray(value) ? value : [value];
        this.valueOptions.pipe(untilDestroyed(this)).subscribe((options) => {
          if (options && Array.isArray(options)) {
            this.valueFormControl.setValue(
              value.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (item: any) => options.find((opt) => `${opt.id}` === `${item}`).id
              )
            );
          }
        });
      } else if (settingValueOptions) {
        this.valueOptions.pipe(untilDestroyed(this)).subscribe((options) => {
          if (options && Array.isArray(options)) {
            this.valueFormControl.setValue(options.find((opt) => `${opt.id}` === `${value}`).id);
          }
        });
      } else {
        this.valueFormControl.setValue(this.getValueOrDate(value, true));
      }
    }
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
    const value = this.getValueOrDate(event.value);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getValueOrDate(value: any, forceDateType?: boolean) {
    if (Array.isArray(value) || !value || `${value}`.indexOf(this.extendedComponentData.escapedValue) >= 0) {
      return value;
    } else if (this.dataType === 'DATE' || this.dataType === 'DATETIME' || this.dataType === 'TIME') {
      if (typeof value === 'string' && value.indexOf('/') > 0) {
        if (forceDateType) {
          let hora = '';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let fecha: any = value.split(' ');
          if (fecha.length > 1) {
            hora = ` ${fecha[1]}`;
          }
          fecha = fecha[0].split('/');
          const newValue = `${fecha[2]}/${fecha[1]}/${fecha[0]}${hora}`;
          return new Date(newValue);
        }
        return value;
      } else if (typeof value === 'string' && value.indexOf(':') > 0) {
        if (forceDateType) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fecha: any = moment().format('YYYY/M/D');
          const newValue = `${fecha} ${value}`;
          const date = moment(newValue);
          return date;
        }
        return value;
      } else {
        let format = '';
        if (this.dataType === 'DATE') {
          format = 'D/M/YYYY';
        } else if (this.dataType === 'DATETIME') {
          format = 'D/M/YYYY HH:mm';
        } else if (this.dataType === 'TIME') {
          format = 'HH:mm';
        }
        return moment(value).format(format);
      }
    } else if (this.dataType === 'NUMBER' && typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
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
    const operator = this.operatorFormControl.value;
    let value1 = this.getValueOrDate(this.valueFormControl.value);
    let value2 = this.getValueOrDate(this.valueFormControl2.value);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      operator,
      value: null
    };
    if (operator?.code !== 'BET' && (value1 || value1 === false)) {
      data.value = value1;
    } else if (operator?.code === 'BET' && (value1 || value1 === false) && (value2 || value2 === false)) {
      value1 = value1 ? (value1 === true ? 'true' : value1) : 'false';
      value2 = value2 ? (value2 === true ? 'true' : value2) : 'false';
      data.value = [value1, value2];
    } else {
      console.log('Falta algún dato');
    }
    return of(data);
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
