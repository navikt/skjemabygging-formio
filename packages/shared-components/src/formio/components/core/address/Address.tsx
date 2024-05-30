import NavAddress from '../../../../components/address/NavAddress';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import addressBuilder from './Address.builder';
import addressForm from './Address.form';

class Address extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Adresse',
      type: 'navAddress',
      key: 'address',
    });
  }

  static editForm() {
    return addressForm();
  }

  static get builderInfo() {
    return addressBuilder();
  }

  updateValue(value) {
    super.updateValue(value, { modified: true });
  }

  renderReact(element) {
    element.render(
      <>
        <ComponentUtilsProvider component={this}>
          <NavAddress updateValue={this.updateValue.bind(this)}></NavAddress>
        </ComponentUtilsProvider>
      </>,
    );
  }
}

export default Address;
