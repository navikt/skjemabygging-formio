import NavSelect from '../../core/select/Select';
import areaCodeSelectBuilder from './AreaCodeSelect.builder';

class AreaCodeSelect extends NavSelect {
  static schema() {
    return {
      ...super.schema(),
      label: 'Velg landskode',
      type: 'areaCode',
      key: 'areaCode',
      fieldSize: 'input--m',
      data: {
        url: 'https://www.nav.no/fyllut/api/area-codes?lang=nb',
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
    super.init({ skipOnlyAvailableItems: true });
  }

  static get builderInfo() {
    return areaCodeSelectBuilder();
  }
}

export default AreaCodeSelect;
