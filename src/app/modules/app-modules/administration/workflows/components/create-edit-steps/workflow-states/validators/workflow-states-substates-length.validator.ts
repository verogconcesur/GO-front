import { AbstractControl, ValidatorFn } from '@angular/forms';
import { passwordPattern } from '@app/constants/patterns.constants';

export default class WorkflowStateSubstatesLengthValidator {
  static fbArrayLengthValidation(controlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      if (control?.value.length) {
        return null;
      } else {
        controls.get(controlName)?.setErrors({ statesSubstatesLengthError: true });
        return { statesSubstatesLengthError: true };
      }
    };
  }
}
