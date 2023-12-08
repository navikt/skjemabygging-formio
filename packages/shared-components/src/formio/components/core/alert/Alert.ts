import Field from 'formiojs/components/_classes/field/Field';
import HTMLElement from 'formiojs/components/html/HTML';
import FormBuilderOptions from '../../../form-builder-options';
import alertBuilder from './Alert.builder';
import alertForm from './Alert.form';

class Alert extends HTMLElement {
  static schema(...extend) {
    return Field.schema({
      ...FormBuilderOptions.builder.layout.components.alertstripe.schema,
      ...extend,
    });
  }

  static editForm() {
    return alertForm();
  }

  static get builderInfo() {
    return alertBuilder();
  }
}

export default Alert;
