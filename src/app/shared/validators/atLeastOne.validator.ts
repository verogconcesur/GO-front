import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';

export class AtLeastOneRequiredValidator {
  static validate(fields: string[]): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
      if (!(formGroup instanceof FormGroup)) {
        throw new Error('FormGroup is required for this validator');
      }

      const isValid = fields.some((field) => formGroup.get(field)?.value);
      return isValid ? null : { atLeastOneRequired: true };
    };
  }
}
