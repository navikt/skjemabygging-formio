import Container from '../container/Container';
import rowBuilder from './Row.builder';

class Row extends Container {
  static schema() {
    return Container.schema({
      label: 'Rad',
      key: 'rad',
      type: 'row',
      components: [],
    });
  }

  static get builderInfo() {
    return rowBuilder();
  }

  get defaultSchema() {
    return Row.schema();
  }

  get templateName() {
    return 'row';
  }
}

export default Row;
