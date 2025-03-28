import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AdvancedSearchItem } from '@data/models/adv-search/adv-search-dto';
import AdvSearchOperatorDTO from '@data/models/adv-search/adv-search-operator-dto';
import AdvancedSearchOptionsDTO from '@data/models/adv-search/adv-search-options-dto';
import {
  AdvSearchCriteriaDialogComponent,
  AdvSearchCriteriaDialogComponentModalEnum
} from '@modules/app-modules/advanced-search/components/adv-search-criteria-dialog/adv-search-criteria-dialog.component';
import {
  AdvSearchCriteriaEditionDialogComponent,
  AdvSearchCriteriaEditionDialogComponentModalEnum
  // eslint-disable-next-line max-len
} from '@modules/app-modules/advanced-search/components/adv-search-criteria-edition-dialog/adv-search-criteria-edition-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { removeItemInFormArray } from '@shared/utils/removeItemInFormArray';
import { take } from 'rxjs';
import { WorkflowsEventsConditionsAuxService } from './wf-events-conditions-aux.service';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-wf-events-conditions',
  templateUrl: './wf-events-conditions.component.html',
  styleUrls: ['./wf-events-conditions.component.scss']
})
export class WfEventsConditionsComponent implements OnInit {
  @Input() criteria: FormArray = new FormArray([]);
  @Input() criteriaOptions: AdvancedSearchOptionsDTO = { cards: {}, entities: {} };
  @Input() operators: AdvSearchOperatorDTO[] = [];
  @Input() escapedValue = '';
  @Input() title = '';

  public labels = {
    noConditionsTitle: marker('workflows.conditionalEvents.noConditionsTitle'),
    conditionsTitle: marker('workflows.conditionalEvents.conditionsTitle'),
    addCriteriaButton: marker('workflows.conditionalEvents.addCriteriaButton')
  };

  constructor(
    private customDialogService: CustomDialogService,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService,
    private wfEventsConditiosAuxService: WorkflowsEventsConditionsAuxService
  ) {}

  ngOnInit(): void {}

  criteriaErrors(): boolean {
    let error = false;
    this.criteria.controls.reduce((a: boolean, b: FormGroup) => {
      if (!error && this.errorInCriteriaConfig(b)) {
        error = true;
      }
      return error;
    }, false);
    return error;
  }

  addCriteriaFilter(): void {
    this.customDialogService
      .open({
        component: AdvSearchCriteriaDialogComponent,
        extendedComponentData: {
          options: this.criteriaOptions,
          selected: this.criteria.value,
          mode: 'CRITERIA',
          title: marker('workflows.conditionalEvents.addConditionalCriteria')
        },
        id: AdvSearchCriteriaDialogComponentModalEnum.ID,
        panelClass: AdvSearchCriteriaDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((data: AdvancedSearchItem[]) => {
        const criteriaItems = this.criteria.getRawValue();
        const currentCriteriaIds = criteriaItems.map((col: AdvancedSearchItem) => this.getCrirteriaCustomId(col));
        data.forEach((c: AdvancedSearchItem) => {
          const index = currentCriteriaIds.indexOf(this.getCrirteriaCustomId(c));
          if (index >= 0) {
            //Ya lo tengo dentro del formulario
            currentCriteriaIds.splice(index, 1);
          } else if (index === -1) {
            //No lo tengo en el formulario
            this.addCriteria(c);
          }
        });
        if (currentCriteriaIds.length) {
          this.removeCriteriaOrColFromFormArray(this.criteria, currentCriteriaIds);
        }
      });
  }

  getCrirteriaCustomId(c: AdvancedSearchItem): string {
    if (c.tabItem) {
      return `tabItem-${c.tabItem.id}`;
    } else {
      return `variable-${c.variable.id}`;
    }
  }

  getCriteriaName(criteriaFg: FormGroup): string {
    const criteria = criteriaFg.value;
    if (criteria.tabItem) {
      return criteria.tabItem.name;
    } else {
      return criteria.variable.name;
    }
  }

  getCriteriaInfo(criteriaFg: FormGroup): string {
    const criteriaValue = criteriaFg.value;
    let value = '';
    if (
      `${criteriaValue.value}`?.indexOf(this.escapedValue) >= 0 ||
      criteriaValue.advancedSearchOperator.code === 'IN' ||
      criteriaValue.advancedSearchOperator.code === 'NIN' ||
      criteriaValue.advancedSearchOperator.code === 'BET'
    ) {
      if (criteriaValue.advancedSearchOperator.code === 'BET') {
        value = this.translateService.instant(marker('advSearch.itemsBetween'), {
          from: criteriaValue.value.split(this.escapedValue)[0],
          to: criteriaValue.value.split(this.escapedValue)[1]
        });
      } else {
        value = this.translateService.instant(marker('advSearch.itemsInArray'), {
          num: criteriaValue.value.split(this.escapedValue).length
        });
      }
    } else if (
      criteriaValue.tabItem?.typeItem === 'LIST' ||
      criteriaValue.variable?.dataType === 'ENTITY' ||
      (criteriaValue.value && typeof criteriaValue.value === 'object')
    ) {
      value = this.translateService.instant(marker('advSearch.optionSelected'));
    } else {
      value = criteriaValue.value;
    }
    if (criteriaValue.advancedSearchOperator?.name && value) {
      return `${criteriaValue.advancedSearchOperator.name}: ${value}`;
    } else if (criteriaValue.advancedSearchOperator?.name) {
      return criteriaValue.advancedSearchOperator.name;
    }
  }

  errorInCriteriaConfig(criteria: FormGroup): string {
    const criteriaValue = criteria.value as AdvancedSearchItem;
    if (
      !criteriaValue.advancedSearchOperator ||
      (!criteriaValue?.value &&
        criteriaValue.advancedSearchOperator.code !== 'ISNULL' &&
        criteriaValue.advancedSearchOperator.code !== 'NOTISNULL')
    ) {
      return this.translateService.instant(marker('advSearch.criteriaWithoutConfig'));
    }
    return null;
  }

  deleteCriteria(criteria: FormGroup) {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('advSearch.deleteCriteriaConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          removeItemInFormArray(this.criteria, criteria.value.orderNumber - 1, true);
        }
      });
  }

  editCriteria(criteria: FormGroup) {
    this.customDialogService
      .open({
        component: AdvSearchCriteriaEditionDialogComponent,
        extendedComponentData: {
          operators: this.operators,
          criteria,
          escapedValue: this.escapedValue,
          title: marker('workflows.conditionalEvents.editConditionalCriteria')
        },
        id: AdvSearchCriteriaEditionDialogComponentModalEnum.ID,
        panelClass: AdvSearchCriteriaEditionDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe((data: any) => {
        if (data) {
          criteria.get('advancedSearchOperator').setValue(data.operator);
          const value = Array.isArray(data.value)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data.value.map((i: any) => (i?.id ? i.id : i)).join(this.escapedValue)
            : data.value;
          criteria.get('value').setValue(value);
          criteria.markAsDirty();
          criteria.markAsTouched();
        }
      });
  }

  addCriteria(value: AdvancedSearchItem): void {
    if (this.criteria) {
      this.criteria.push(this.wfEventsConditiosAuxService.getCriteriaFormGroup(value, this.criteria.length + 1));
      this.criteria.markAsDirty();
      this.criteria.markAsTouched();
    }
  }
  removeCriteriaOrColFromFormArray = (formArray: FormArray, ids: string[]): void => {
    const nextId = ids.shift();
    const control = formArray.controls.find((c: FormGroup) => this.getCrirteriaCustomId(c.value) === nextId);
    removeItemInFormArray(formArray, control.value.orderNumber - 1, true);
    //Verificar y corregir los ordeNumbers de los elementos restantes
    formArray.controls.forEach((c: FormGroup, index: number) => {
      c.get('orderNumber').setValue(index + 1);
    });
    if (ids.length) {
      this.removeCriteriaOrColFromFormArray(formArray, ids);
    }
  };
}
