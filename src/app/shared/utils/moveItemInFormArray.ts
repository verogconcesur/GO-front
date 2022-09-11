import { FormArray } from '@angular/forms';

export const moveItemInFormArray = (formArray: FormArray, fromIndex: number, toIndex: number): void => {
  const dir = toIndex > fromIndex ? 1 : -1;

  const item = formArray.at(fromIndex);
  for (let i = fromIndex; i * dir < toIndex * dir; i = i + dir) {
    const current = formArray.at(i + dir);
    if (current.get('orderNumber')) {
      current.get('orderNumber').setValue(i + 1);
    }
    formArray.setControl(i, current);
  }
  if (item.get('orderNumber')) {
    item.get('orderNumber').setValue(toIndex + 1);
  }
  formArray.setControl(toIndex, item);
};
