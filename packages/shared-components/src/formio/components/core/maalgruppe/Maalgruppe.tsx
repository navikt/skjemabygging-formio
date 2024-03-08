import BaseComponent from '../../base/BaseComponent';
import maalgruppeBuilder from './Maalgruppe.builder';
import maalgruppeForm from './Maalgruppe.form';
import { findSelectedMaalgruppe } from './Maalgruppe.utils';

export interface MaalgruppeValueType {
  calculated?: string;
  prefilled?: string;
}
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

  calculateMaalgruppeValue(): MaalgruppeValueType {
    const activityMaalgruppe = this.data?.aktivitet?.maalgruppe;
    const prefilledMaalgruppe = this.data?.maalgruppe?.prefilled || this.component?.defaultValue;
    return {
      calculated: activityMaalgruppe || findSelectedMaalgruppe(this.root?.data || {}) || 'ANNET',
      prefilled: prefilledMaalgruppe,
    };
  }

  renderReact(element: any) {
    element.render(<></>);
  }
}

export default Maalgruppe;
