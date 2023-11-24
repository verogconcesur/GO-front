import { UntypedFormArray } from '@angular/forms';

export const removeItemInFormArray = (formArray: UntypedFormArray, index: number): void => {
  formArray.removeAt(index);
  for (let i = 0; i <= formArray.length; i = i + 1) {
    const current = formArray.at(i);
    if (current && current.get('orderNumber')) {
      current.get('orderNumber').setValue(i + 1);
    }
  }
};
