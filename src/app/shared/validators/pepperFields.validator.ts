import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';

export class PepperFieldsValidator {
  static validate(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
      if (!(formGroup instanceof FormGroup)) {
        throw new Error('FormGroup is required for this validator');
      }

      const pepperUser = formGroup.get('pepperUser')?.value?.trim();
      const pepperPass = formGroup.get('pepperPass')?.value?.trim();
      const pepperSecret = formGroup.get('pepperSecret')?.value?.trim();

      const filledCount = [pepperUser, pepperPass, pepperSecret].filter(Boolean).length;

      if (filledCount === 0) {
        formGroup.get('pepperUser')?.setErrors(null);
        formGroup.get('pepperPass')?.setErrors(null);
        formGroup.get('pepperSecret')?.setErrors(null);
        return null;
      }

      let hasError = false;

      if (!pepperUser) {
        formGroup.get('pepperUser')?.setErrors({ required: true });
        hasError = true;
      } else {
        formGroup.get('pepperUser')?.setErrors(null);
      }

      if (!pepperPass) {
        formGroup.get('pepperPass')?.setErrors({ required: true });
        hasError = true;
      } else {
        formGroup.get('pepperPass')?.setErrors(null);
      }

      if (!pepperSecret) {
        formGroup.get('pepperSecret')?.setErrors({ required: true });
        hasError = true;
      } else {
        formGroup.get('pepperSecret')?.setErrors(null);
      }

      return hasError ? { pepperFieldsIncomplete: true } : null;
    };
  }
}
