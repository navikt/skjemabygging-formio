import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import TextField from '../../core/textfield/deprecated/TextField.js';
import organizationNumberBuilder from './OrganizationNumber.builder';
import organizationNumberForm from './OrganizationNumber.form';

class OrganizationNumber extends TextField {
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
