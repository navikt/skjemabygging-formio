import FormBuilderOptions from '../../form-builder-options';
import NavSelect from '../nav-select/NavSelect';

class CountrySelect extends NavSelect {
  static get builderInfo() {
    return {
      title: 'Landvelger',
      key: 'landvelger',
      group: 'person',
      icon: 'th-list',
      schema: CountrySelect.schema(),
    };
  }

  static schema(...extend) {
    return NavSelect.schema({
      ...FormBuilderOptions.builder.person.components.landvelger.schema,
      ...extend,
    });
  }

  static editForm(...extend) {
    return NavSelect.editForm([
      {
        key: 'display',
        components: [
          { key: 'placeholder', ignore: true },
          { key: 'tabindex', ignore: true },
          { key: 'tooltip', ignore: true },
          { key: 'customClass', ignore: true },
          { key: 'hidden', ignore: true },
          { key: 'hideLabel', ignore: true },
          { key: 'autofocus', ignore: true },
          { key: 'disabled', ignore: true },
          { key: 'tableView', ignore: true },
          { key: 'modalEdit', ignore: true },
          { key: 'uniqueOptions', ignore: true },
        ],
      },
      {
        key: 'data',
        components: [
          { key: 'dataSrc', ignore: true },
          { key: 'data.url', ignore: true },
          { key: 'data.headers', ignore: true },
          { key: 'selectValues', ignore: true },
          { key: 'dataType', ignore: true },
          { key: 'valueProperty', ignore: true },
          { key: 'disableLimit', ignore: true },
          { key: 'lazyLoad', ignore: true },
        ],
      },
      {
        key: 'validation',
        components: [{ key: 'unique', ignore: true }],
      },
      {
        key: 'api',
        components: [
          { key: 'tags', ignore: true },
          { key: 'properties', ignore: true },
        ],
      },
      { key: 'logic', ignore: true },
      { key: 'layout', ignore: true },
      ...extend,
    ]);
  }
}

export default CountrySelect;