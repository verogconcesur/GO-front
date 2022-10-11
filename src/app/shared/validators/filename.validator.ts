import { AbstractControl, ValidatorFn } from '@angular/forms';

export default class FilenameValidator {
  static validate(controlName: string): ValidatorFn {
    return (control: AbstractControl) => {
      if (control?.value) {
        const name = control.value;
        if (/:|\/|\?|\\|\*|\"|<|>|\||\[|\]|\{|\}|%/g.test(name)) {
          return { filename: true };
        } else if (name.split('.').length !== 2) {
          return { extension: true };
        } else if (name.split('.')[0].length === 0 || name.split('.')[1].length === 0) {
          return { extension: true };
        }
        return null;
      } else {
        return null;
      }
    };
  }
}
