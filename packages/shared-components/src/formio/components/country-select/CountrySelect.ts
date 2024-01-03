import BaseComponent from '../base/BaseComponent';
import NavSelect from '../nav-select/NavSelect';

class CountrySelect extends NavSelect {
  static get builderInfo() {
    return {
      title: 'Landvelger',
      key: 'landvelger',
      group: 'person',
      icon: 'home',
      schema: {
        ...CountrySelect.schema(),
        ...BaseComponent.defaultBuilderInfoSchema(),
      },
    };
  }

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

  get defaultSchema() {
    return CountrySelect.schema();
  }
}

export default CountrySelect;
