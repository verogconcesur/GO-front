import { AbstractControl, ValidatorFn } from '@angular/forms';
import { passwordPattern } from '@app/constants/patterns.constants';

export default class ConfirmPasswordValidator {
  static mustMatch(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);

      if (checkControl?.errors && !checkControl.errors.matching) {
        return null;
      }

      if (control?.value !== checkControl?.value) {
        controls.get(checkControlName)?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }

  static validAndDiffToOriginal(controlName: string, pass: string) {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const regex = new RegExp(passwordPattern);
      if (pass && control?.value === pass) {
        return null;
      } else if (control?.value && !regex.test(control.value)) {
        return { pattern: true };
      }
      return null;
    };
  }
}
