import { formatAccountNumber, removeAllSpaces, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FocusEventHandler } from 'react';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import accountNumberBuilder from './AccountNumber.builder';
import accountNumberForm from './AccountNumber.form';

class AccountNumber extends TextField {
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
      const value = removeAllSpaces(event.currentTarget.value);
      if (value !== '') {
        super.setValueOnReactInstance(formatAccountNumber(value));
      }
    };
  }

  getDisplayValue(): string {
    return formatAccountNumber(super.getDisplayValue());
  }

  handleChange(value: string) {
    super.handleChange(removeAllSpaces(value));
  }
}

export default AccountNumber;
