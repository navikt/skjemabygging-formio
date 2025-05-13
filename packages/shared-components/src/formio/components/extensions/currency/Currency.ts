import { formatNumber, removeAllSpaces, removeAllSpacesAndCommas } from '@navikt/skjemadigitalisering-shared-domain';
import { FocusEventHandler } from 'react';
import BaseComponent from '../../base/BaseComponent';
import Number from '../number/Number';
import currencyBuilder from './Currency.builder';
import currencyForm from './Currency.form';

class Currency extends Number {
  static schema() {
    return BaseComponent.schema({
      label: 'Beløp',
      type: 'currency',
      key: 'belop',
      fieldSize: 'input--s',
      currency: 'nok',
      inputType: 'decimal',
    });
  }

  static editForm() {
    return currencyForm();
  }

  static get builderInfo() {
    return currencyBuilder();
  }

  onBlur(): FocusEventHandler<HTMLInputElement> {
    const isInteger = this.getInputMode() === 'numeric';
    return (event: React.FocusEvent<HTMLInputElement>) => {
      const value = removeAllSpaces(event.currentTarget.value);

      if (value !== '') {
        super.setValueOnReactInstance(formatNumber(value, isInteger));
      }
    };
  }

  getDisplayValue(): string {
    return formatNumber(super.getDisplayValue(), this.getInputMode() === 'numeric');
  }

  handleChange(value: string) {
    super.handleChange(removeAllSpacesAndCommas(value));
  }
}

export default Currency;
