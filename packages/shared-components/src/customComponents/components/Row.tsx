import FormBuilderOptions from '../../Forms/form-builder-options';
import Container from './Container';

class Row extends Container {
  static get builderInfo() {
    const { title, key, icon } = FormBuilderOptions.builder.layout.components.row;
    return {
      title,
      icon,
      key,
      documentation: '',
      weight: 0,
      schema: Row.schema(),
    };
  }

  static schema(...extend) {
    return Container.schema({
      ...FormBuilderOptions.builder.layout.components.row.schema,
      ...extend,
    });
  }

  get templateName() {
    return 'row';
  }
}

export default Row;
