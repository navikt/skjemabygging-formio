import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FormBuilderOptions from '../../../form-builder-options';
import TextField from '../../core/textfield/deprecated/TextField.js';
import accountNumberForm from './AccountNumber.form';

class AccountNumber extends TextField {
  static editForm() {
    return accountNumberForm();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.pengerOgKonto.components.bankAccount;
  }

  validateAccountNumber(accountNumber) {
    if (accountNumber === '') {
      return true;
    }
    return validatorUtils.isAccountNumber(accountNumber + '');
  }
}

export default AccountNumber;
