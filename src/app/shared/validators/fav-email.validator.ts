import { AbstractControl, ValidationErrors } from '@angular/forms';

export class EmailValidator {
  static validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;

    if (!value) {
      return null;
    }

    const emails = value.split(',').map((email) => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allEmailsValid = emails.every((email) => emailRegex.test(email));
    const hasAtLeastOneEmail = emails.length > 0;
    const noEmptyEmails = !emails.some((email) => email === '');
    const isValid = allEmailsValid && hasAtLeastOneEmail && noEmptyEmails;
    return isValid ? null : { invalidEmail: true };
  }
}
