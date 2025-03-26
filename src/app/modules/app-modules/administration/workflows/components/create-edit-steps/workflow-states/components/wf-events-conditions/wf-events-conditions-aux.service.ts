import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdvancedSearchItem } from '@data/models/adv-search/adv-search-dto';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsEventsConditionsAuxService {
  constructor(private fb: FormBuilder) {}

  getCriteriaFormGroup(value: AdvancedSearchItem, orderNumber: number): FormGroup {
    return this.fb.group({
      id: [value.id ? value.id : null],
      tabItem: [value.tabItem ? value.tabItem : null],
      variable: [value.variable ? value.variable : null],
      orderNumber: [value.orderNumber ? value.orderNumber : orderNumber],
      advancedSearchOperator: [value.advancedSearchOperator ? value.advancedSearchOperator : null, Validators.required],
      value: [
        value.value ? value.value : null,
        [
          Validators.required,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (control: any) => {
            const operator = control.parent?.get('advancedSearchOperator')?.value;
            if (operator && operator.code !== 'ISNULL' && operator.code !== 'NOTISNULL' && !control.value) {
              return { required: true };
            }
            return null;
          }
        ]
      ]
    });
  }
}
