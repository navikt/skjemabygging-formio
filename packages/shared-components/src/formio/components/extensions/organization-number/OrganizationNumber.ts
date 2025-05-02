import {
  formatIBAN,
  formatOrganizationNumber,
  removeAllSpaces,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { FocusEventHandler } from 'react';
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
      spellcheck: false,
    });
  }

  static editForm() {
    return organizationNumberForm();
  }

  static get builderInfo() {
    return organizationNumberBuilder();
  }

  validateOrganizationNumber(organizationNumber) {
    if (organizationNumber === '' || organizationNumber === null) {
      return true;
    }

    // Force organizationNumber to string
    const isValid = validatorUtils.isOrganizationNumber(organizationNumber + '');
    return isValid ? true : 'orgNrCustomError';
  }

  onBlur(): FocusEventHandler<HTMLInputElement> {
    return (event: React.FocusEvent<HTMLInputElement>) => {
      const value = removeAllSpaces(event.target.value);
      if (value !== '') {
        event.target.value = formatOrganizationNumber(value);
      }
    };
  }

  getDefaultValue(): string {
    return formatIBAN(super.getDefaultValue());
  }

  handleChange(value: string) {
    const formattedValue = removeAllSpaces(value);
    super.handleChange(formattedValue);
  }
}

export default OrganizationNumber;
