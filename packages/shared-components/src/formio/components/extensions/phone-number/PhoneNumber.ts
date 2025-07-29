import { formatPhoneNumber, InputMode, removeAllSpaces } from '@navikt/skjemadigitalisering-shared-domain';
import { FocusEventHandler } from 'react';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import phoneNumberBuilder from './PhoneNumber.builder';
import phoneNumberForm from './PhoneNumber.form';

export default class PhoneNumber extends TextField {
  static schema() {
    return BaseComponent.schema({
      label: 'Telefonnummer',
      type: 'phoneNumber',
      key: 'telefonNummer',
      areaCode: undefined,
    });
  }

  static editForm() {
    return phoneNumberForm();
  }

  static get builderInfo() {
    return phoneNumberBuilder();
  }

  getInputMode(): InputMode {
    return 'tel';
  }

  onBlur(): FocusEventHandler<HTMLInputElement> {
    return (event: React.FocusEvent<HTMLInputElement>) => {
      const value = removeAllSpaces(event.currentTarget.value);
      if (value !== '') {
        super.setValueOnReactInstance(formatPhoneNumber(value, this.component?.areaCode));
      }
    };
  }

  getDisplayValue(): string {
    return formatPhoneNumber(super.getValue(), this.component?.areaCode);
  }

  handleChange(value: string) {
    super.handleChange(removeAllSpaces(value));
  }
}
