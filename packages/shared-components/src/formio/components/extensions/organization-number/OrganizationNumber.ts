import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FocusEventHandler } from 'react';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import organizationNumberBuilder from './OrganizationNumber.builder';
import organizationNumberForm from './OrganizationNumber.form';

class OrganizationNumber extends TextField {
  private originalValue: string | null = null;

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

    const isValid = validatorUtils.isOrganizationNumber(organizationNumber + '');
    return isValid ? true : 'orgNrCustomError';
  }

  onBlur(): FocusEventHandler<HTMLInputElement> {
    return (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (value) {
        this.originalValue = value;
        const formattedValue = this.formatOrganizationNumber(value);
        this.setValue(formattedValue);
      }
    };
  }

  formatOrganizationNumber(value: string): string {
    return value.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  getValue() {
    return this.originalValue ?? super.getValue();
  }
}

export default OrganizationNumber;
