import FormBuilderOptions from '../../../form-builder-options';
import Container from '../container/Container';

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
    // @ts-ignore
    return Container.schema(
      {
        ...FormBuilderOptions.builder.layout.components.row.schema,
      },
      ...extend,
    );
  }

  get defaultSchema() {
    return Row.schema();
  }

  get templateName() {
    return 'row';
  }
}

export default Row;
