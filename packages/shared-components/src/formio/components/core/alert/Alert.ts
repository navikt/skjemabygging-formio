import Field from 'formiojs/components/_classes/field/Field';
import HTMLElement from 'formiojs/components/html/HTML';
import alertBuilder from './Alert.builder';
import alertForm from './Alert.form';

class Alert extends HTMLElement {
  static schema() {
    return Field.schema({
      label: 'Alertstripe',
      type: 'alertstripe',
      key: 'alertstripe',
      alerttype: 'info',
      input: true,
      clearOnHide: true,
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
