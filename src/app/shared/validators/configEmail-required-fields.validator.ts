/* eslint-disable max-len */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { AbstractControl } from '@angular/forms';

export function validateConfigMailers(control: AbstractControl): { [key: string]: boolean } | null {
  const configMailerHost = control.get('configMailerHost');
  const configMailerPort = control.get('configMailerPort');
  const configMailerUserName = control.get('configMailerUserName');
  const configMailerPass = control.get('configMailerPass');

  if (configMailerHost && configMailerPort && configMailerUserName && configMailerPass) {
    const hostValue = configMailerHost.value;
    const portValue = configMailerPort.value;
    const userNameValue = configMailerUserName.value;
    const passValue = configMailerPass.value;

    const isConfigModified = configMailerHost.dirty || configMailerPort.dirty || configMailerUserName.dirty || configMailerPass.dirty;

    const isAnyFieldFilled = hostValue || portValue || userNameValue || passValue;


    const isAnyFieldTouched = configMailerHost.touched || configMailerPort.touched || configMailerUserName.touched || configMailerPass.touched;

    if ((isConfigModified && isAnyFieldFilled) || isAnyFieldTouched) {

      if (!hostValue || !portValue || !userNameValue || !passValue) {
        return { configMailerRequired: true };
      }
    }
  }

  return null;

}
