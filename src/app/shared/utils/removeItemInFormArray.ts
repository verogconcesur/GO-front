import { FormArray } from '@angular/forms';

export const removeItemInFormArray = (formArray: FormArray, index: number): void => {
  if(index >= 0 && index < formArray.length){
    formArray.removeAt(index);
    for (let i = index; i  <= formArray.length; i = i + 1) {
      const current = formArray.at(i);
      if (current && current.get('orderNumber')) {
        current.get('orderNumber').setValue(current.value.orderNumber-1);
      }
    }
  }
};
