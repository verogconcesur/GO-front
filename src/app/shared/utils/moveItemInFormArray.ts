import { UntypedFormArray } from '@angular/forms';

export const moveItemInFormArray = (formArray: UntypedFormArray, fromIndex: number, toIndex: number): void => {
  const from = formArray.at(fromIndex);
  const to = formArray.at(toIndex);
  formArray.setControl(toIndex, from);
  formArray.setControl(fromIndex, to);
  for (let i = 0; i <= formArray.length; i = i + 1) {
    const current = formArray.at(i);
    if (current && current.get('orderNumber')) {
      current.get('orderNumber').setValue(i + 1);
    }
  }
};
