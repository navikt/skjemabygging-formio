import NavSelect from '../../core/select/Select';
import countrySelectBuilder from './CountrySelect.builder';

class CountrySelect extends NavSelect {
  static schema() {
    return {
      ...super.schema(),
      label: 'Velg land',
      type: 'landvelger',
      key: 'landvelger',
      data: {
        url: 'https://www.nav.no/fyllut/countries?lang=nb',
      },
      dataSrc: 'url',
      disableLimit: true,
    };
  }

  static get builderInfo() {
    return countrySelectBuilder();
  }
}

export default CountrySelect;
