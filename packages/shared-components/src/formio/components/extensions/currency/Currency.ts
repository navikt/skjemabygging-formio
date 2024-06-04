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
}

export default Currency;
