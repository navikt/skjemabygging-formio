import NavSelect from '../nav-select/NavSelect';

class CurrencySelect extends NavSelect {
  static get builderInfo() {
    return {
      title: 'Valutavelger',
      key: 'valutavelger',
      group: 'pengerOgKonto',
      icon: 'home',
      schema: {
        ...CurrencySelect.schema(),
        validate: {
          required: true,
        },
      },
    };
  }

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

  get defaultSchema() {
    return CurrencySelect.schema();
  }
}

export default CurrencySelect;
