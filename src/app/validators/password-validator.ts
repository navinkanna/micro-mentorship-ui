import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = `${control.value ?? ''}`;

    if (!value) {
      return null;
    }

    const issues: string[] = [];

    if (value.length < 8) {
      issues.push('minLength');
    }

    if (value.length > 128) {
      issues.push('maxLength');
    }

    if (!/[a-z]/.test(value)) {
      issues.push('lowercase');
    }

    if (!/[A-Z]/.test(value)) {
      issues.push('uppercase');
    }

    if (!/\d/.test(value)) {
      issues.push('number');
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
      issues.push('specialCharacter');
    }

    if (/\s/.test(value)) {
      issues.push('whitespace');
    }

    return issues.length > 0 ? { passwordStrength: issues } : null;
  };
}
