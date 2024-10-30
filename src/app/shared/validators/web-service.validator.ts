import { AbstractControl, ValidationErrors } from '@angular/forms';

export class WebserviceUrlValidator {
  static validate(control: AbstractControl): ValidationErrors | null {
    const webservice = control.get('webservice')?.value;
    const webserviceUrl = control.get('workflowEventWebserviceConfig.webserviceUrl')?.value;

    if (webservice === undefined || webserviceUrl === undefined) {
      return null;
    }
    return webservice && !webserviceUrl ? { webserviceUrlRequired: true } : null;
  }
}
