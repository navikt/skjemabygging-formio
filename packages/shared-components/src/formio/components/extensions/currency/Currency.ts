import FormioCurrency from 'formiojs/components/currency/Currency';
import currencyBuilder from './Currency.builder';
import currencyForm from './Currency.form';

class Currency extends FormioCurrency {
  static editForm() {
    return currencyForm();
  }

  static get builderInfo() {
    return currencyBuilder();
  }
}

export default Currency;
