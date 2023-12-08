import NavSelect from '../../core/select/Select';
import currencySelectBuilder from './CurrencySelect.builder';

class CurrencySelect extends NavSelect {
  static schema() {
    return {
      ...super.schema(),
      label: 'Velg valuta',
      type: 'valutavelger',
      key: 'valutavelger',
      fieldSize: 'input--m',
      data: {
        url: 'https://www.nav.no/fyllut/api/common-codes/currencies?lang=nb',
      },
      dataSrc: 'url',
      disableLimit: true,
    };
  }

  static get builderInfo() {
    return currencySelectBuilder();
  }
}

export default CurrencySelect;
