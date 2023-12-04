import { AbstractControl, ValidatorFn } from '@angular/forms';

export default class CombinedRequiredFieldsValidator {
  static field1RequiredIfFieldsConditions(
    controlToValidate: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controlsToCheck: { control: string; value: any; operation: 'equal' | 'diff' }[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controlsPrevConditions?: { control: string; value: any; operation: 'equal' | 'diff' }[]
  ): ValidatorFn {
    return (controls: AbstractControl) => {
      const control1 = controls.get(controlToValidate);
      let showError = false;
      let prevConditionsOk = true;

      controlsPrevConditions?.forEach((prevConditions) => {
        if (prevConditionsOk) {
          if (prevConditions.operation === 'equal' && controls.get(prevConditions.control)?.value !== prevConditions.value) {
            prevConditionsOk = false;
          } else if (
            prevConditions.operation === 'diff' &&
            controls.get(prevConditions.control)?.value === prevConditions.value
          ) {
            prevConditionsOk = false;
          }
        }
      });

      // Si no se cumplen las condiones previas nos saltamos el chequeo
      if (!prevConditionsOk || !control1) {
        // controls.get(controlToValidate)?.setErrors(null);
        return null;
      }
      controlsToCheck.forEach((controlToCheck) => {
        let value = controls.get(controlToCheck.control)?.value;
        if (!value && value !== 0 && !controlToCheck.value && controlToCheck.value !== value) {
          value = controlToCheck.value;
        }
        if (!showError && !control1.value && control1.value !== 0) {
          if (controlToCheck.operation === 'equal' && value === controlToCheck.value) {
            showError = true;
          } else if (controlToCheck.operation === 'diff' && value !== controlToCheck.value) {
            showError = true;
          }
        }
      });
      if (showError) {
        controls.get(controlToValidate)?.setErrors({ required: true });
        return { required: true };
      } else {
        controls.get(controlToValidate)?.setErrors(null);
      }
      // controls.get(controlToValidate)?.setErrors(null);
      return null;
    };
  }

  static field1ExclusiveIfField2Condition(
    controlToValidate: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controlToCheck: { control: string; value: any; operation: 'equal' | 'diff' }
  ): ValidatorFn {
    return (controls: AbstractControl) => {
      const control1 = controls.get(controlToValidate);
      const control2 = controls.get(controlToCheck.control);
      if (!control1?.value || !control2) {
        controls.get(controlToValidate)?.setErrors(null);
        return null;
      }
      if (controlToCheck.operation === 'equal' && control2.value === controlToCheck.value) {
        controls.get(controlToValidate)?.setErrors({ exclusive: true });
        return { exclusive: true };
      } else if (controlToCheck.operation === 'diff' && control2.value !== controlToCheck.value) {
        controls.get(controlToValidate)?.setErrors({ exclusive: true });
        return { exclusive: true };
      }
      controls.get(controlToValidate)?.setErrors(null);
      return null;
    };
  }
}
