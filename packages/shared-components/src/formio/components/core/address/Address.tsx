import BaseComponent from '../../base/BaseComponent';
import addressBuilder from './Address.builder';
import addressForm from './Address.form';

class Address extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Folkeregistrert adresse',
      type: 'navAddress',
      key: 'folkeregistrertAdresse',

      hideLabel: true,
      clearOnHide: false,
    });
  }

  static editForm() {
    return addressForm();
  }

  static get builderInfo() {
    return addressBuilder();
  }

  renderReact(element) {
    element.render(<></>);
  }
}

export default Address;
