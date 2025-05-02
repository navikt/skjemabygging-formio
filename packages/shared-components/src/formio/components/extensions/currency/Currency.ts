import { FocusEventHandler } from 'react';
import BaseComponent from '../../base/BaseComponent';
import Number from '../number/Number';
import currencyBuilder from './Currency.builder';
import currencyForm from './Currency.form';

class Currency extends Number {
  private originalValue: string | null = null;

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
    return (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (value) {
        this.originalValue = value;
        const formattedValue = this.formatCurrency(value);
        this.setValue(formattedValue);
      }
    };
  }

  // TODO fiks
  formatCurrency(value: string): string {
    return value.toLocaleString('no-NO', { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getValue() {
    return this.originalValue ?? super.getValue();
  }
}

export default Currency;
