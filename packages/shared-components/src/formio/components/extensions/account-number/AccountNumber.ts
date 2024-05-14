import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
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
}

export default AccountNumber;
