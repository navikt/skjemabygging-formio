import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import organizationNumberBuilder from './OrganizationNumber.builder';
import organizationNumberForm from './OrganizationNumber.form';

class OrganizationNumber extends TextField {
  static schema() {
    return BaseComponent.schema({
      label: 'Organisasjonsnummer',
      type: 'orgNr',
      key: 'orgNr',
      fieldSize: 'input--s',
      input: true,
      spellcheck: false,
      dataGridLabel: true,
      clearOnHide: true,
      delimiter: true,
      truncateMultipleSpaces: false,
      requireDecimal: false,
      maxLength: 9,
      displayMask: '999 999 999',
      inputMaskPlaceholderChar: ' ', // U+00a0 -space
    });
  }

  static editForm() {
    return organizationNumberForm();
  }
  static get builderInfo() {
    return organizationNumberBuilder();
  }

  validateOrganizationNumber(organizationNumber) {
    if (organizationNumber === '') {
      return true;
    }

    // Force organizationNumber to string
    const isValid = validatorUtils.isOrganizationNumber(organizationNumber + '');
    return isValid ? true : 'orgNrCustomError';
  }
}

export default OrganizationNumber;
