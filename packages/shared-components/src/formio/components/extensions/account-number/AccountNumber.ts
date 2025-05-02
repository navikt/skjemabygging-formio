import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FocusEventHandler } from 'react';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import accountNumberBuilder from './AccountNumber.builder';
import accountNumberForm from './AccountNumber.form';

class AccountNumber extends TextField {
  private originalValue: string | null = null;

  static schema() {
    return BaseComponent.schema({
      label: 'Kontonummer',
      type: 'bankAccount',
      key: 'kontoNummer',
      fieldSize: 'input--s',
      spellcheck: false,
    });
  }

  static editForm() {
    return accountNumberForm();
  }

  static get builderInfo() {
    return accountNumberBuilder();
  }

  validateAccountNumber(accountNumber) {
    if (accountNumber === '' || accountNumber === null) {
      return true;
    }
    const isValid = validatorUtils.isAccountNumber(accountNumber + '');
    return isValid ? true : 'accountNumberCustomError';
  }

  onBlur(): FocusEventHandler<HTMLInputElement> {
    return (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (value) {
        this.originalValue = value;
        const formattedValue = this.formatAccountNumber(value);
        this.setValue(formattedValue);
      }
    };
  }

  formatAccountNumber(value: string): string {
    return value.replace(/(\d{4})(\d{2})(\d{5})/, '$1 $2 $3');
  }

  getValue() {
    return this.originalValue ?? super.getValue();
  }
}

export default AccountNumber;
