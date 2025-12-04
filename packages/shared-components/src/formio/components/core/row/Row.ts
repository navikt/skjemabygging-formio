import baseComponentUtils from '../../base/baseComponentUtils';
import Container from '../container/Container';
import rowBuilder from './Row.builder';
import rowForm from './Row.form';

class Row extends Container {
  static schema() {
    return Container.schema({
      label: 'Rad',
      key: 'rad',
      type: 'row',
      components: [],
    });
  }

  static editForm() {
    return rowForm();
  }

  static get builderInfo() {
    return rowBuilder();
  }

  init() {
    super.init();
    baseComponentUtils.setupBuilderErrors(this);
  }

  get defaultSchema() {
    return Row.schema();
  }

  get templateName() {
    return 'row';
  }
}

export default Row;
