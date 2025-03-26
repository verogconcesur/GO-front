import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AdvancedSearchItem } from '@data/models/adv-search/adv-search-dto';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsEventsConditionsAuxService {
  constructor(private fb: FormBuilder) {}

  getCriteriaFormGroup(value: AdvancedSearchItem, orderNumber: number): FormGroup {
    return this.fb.group({
      id: [value.id ? value.id : null],
      // advancedSearchId: [
      //   value.advancedSearchId ? value.advancedSearchId : this.advSearchForm.value.id ? this.advSearchForm.value.id : null
      // ],
      tabItem: [value.tabItem ? value.tabItem : null],
      variable: [value.variable ? value.variable : null],
      orderNumber: [value.orderNumber ? value.orderNumber : orderNumber],
      advancedSearchOperator: [value.advancedSearchOperator ? value.advancedSearchOperator : null],
      value: [value.value ? value.value : null]
    });
  }
}
