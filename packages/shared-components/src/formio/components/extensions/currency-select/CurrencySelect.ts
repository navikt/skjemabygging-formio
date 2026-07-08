import NavSelect from '../../core/select/Select';
import currencySelectBuilder from './CurrencySelect.builder';

const getCurrencyLanguageCode = () => {
  const search = typeof window === 'undefined' ? '' : window.location.search;
  const languageCode = new URLSearchParams(search).get('lang') ?? 'nb';
  return languageCode.split('-')[0];
};

class CurrencySelect extends NavSelect {
  static schema() {
    return {
      ...super.schema(),
      label: 'Velg valuta',
      type: 'valutavelger',
      key: 'valutavelger',
      fieldSize: 'input--m',
      data: {
        url: '/fyllut/api/common-codes/currencies?lang=nb',
      },
      dataSrc: 'url',
      disableLimit: true,
      validate: {
        required: true,
        onlyAvailableItems: false,
      },
    };
  }

  init() {
    const component = this.component!;
    component.data = {
      ...component.data,
      url: `/fyllut/api/common-codes/currencies?lang=${getCurrencyLanguageCode()}`,
    };
    super.init({ skipOnlyAvailableItems: true });
  }

  static get builderInfo() {
    return currencySelectBuilder();
  }
}

export default CurrencySelect;
