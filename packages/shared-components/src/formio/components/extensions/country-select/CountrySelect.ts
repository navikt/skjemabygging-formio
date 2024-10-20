import { getCountries } from '../../../../util/countries/countries';
import NavSelect from '../../core/select/Select';
import countrySelectBuilder from './CountrySelect.builder';
import countrySelectForm from './CountrySelect.form';

class CountrySelect extends NavSelect {
  static schema() {
    return {
      ...super.schema(),
      label: 'Velg land',
      type: 'landvelger',
      key: 'landvelger',
      dataSrc: 'values',
      disableLimit: true,
      validate: {
        required: true,
        onlyAvailableItems: false,
      },
    };
  }

  init() {
    if (this.component?.dataSrc === 'url') {
      this.component.dataSrc = 'values';
    }

    if (this.component) {
      this.component.data = {
        values: getCountries('nb'),
      };
    }

    if (this.component?.ignoreNorway) {
      this.ignoreOptions = ['NO'];
    }
    super.init({ skipOnlyAvailableItems: true });
  }

  static editForm() {
    return countrySelectForm(CountrySelect.schema().type);
  }

  static get builderInfo() {
    return countrySelectBuilder();
  }
}

export default CountrySelect;
