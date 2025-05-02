import { formatCurrency, removeAllSpaces } from '@navikt/skjemadigitalisering-shared-domain';
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
      const value = removeAllSpaces(event.target.value);

      if (value !== '') {
        event.target.value = formatCurrency(value, isInteger);
      }
    };
  }

  getDefaultValue(): string {
    return formatCurrency(super.getDefaultValue(), this.getInputMode() === 'numeric');
  }

  handleChange(value: string) {
    const originalValue = removeAllSpaces(value);
    super.handleChange(originalValue);
  }
}

export default Currency;
