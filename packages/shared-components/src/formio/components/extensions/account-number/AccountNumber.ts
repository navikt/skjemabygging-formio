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
      input: true,
      dataGridLabel: true,
      spellcheck: false,
      clearOnHide: true,
      displayMask: '9999 99 99999',
      inputMaskPlaceholderChar: ' ', // U+00a0 -space
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
    return validatorUtils.isAccountNumber(accountNumber + '');
  }
}

export default AccountNumber;
