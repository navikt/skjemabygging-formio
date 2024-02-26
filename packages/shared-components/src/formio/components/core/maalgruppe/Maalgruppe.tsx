import BaseComponent from '../../base/BaseComponent';
import maalgruppeBuilder from './Maalgruppe.builder';
import maalgruppeForm from './Maalgruppe.form';

class Maalgruppe extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Målgruppe',
      type: 'maalgruppe',
      key: 'maalgruppe',
      hideLabel: true,
      hidden: true,
      clearOnHide: false,
    });
  }

  static editForm() {
    return maalgruppeForm();
  }

  static get builderInfo() {
    return maalgruppeBuilder();
  }

  calculateMaalgruppeValue() {
    if (!!this.data?.aktivitet?.maalgruppe) {
      return this.data?.aktivitet.maalgruppe;
    } else if (!!this.component?.defaultValue) {
      return this.component.defaultValue;
    } else {
      return 'ANNET';
    }
  }

  renderReact(element: any) {
    element.render(<></>);
  }
}

export default Maalgruppe;
