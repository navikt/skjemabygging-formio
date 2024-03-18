import { SendInnMaalgruppe, SubmissionMaalgruppe } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
import maalgruppeBuilder from './Maalgruppe.builder';
import maalgruppeForm from './Maalgruppe.form';
import { findSelectedMaalgruppe } from './Maalgruppe.utils';

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

  calculateMaalgruppeValue(): SubmissionMaalgruppe {
    const prefilledMaalgruppe = (this.data?.maalgruppe?.prefilled || this.component?.defaultValue) as SendInnMaalgruppe;

    return {
      calculated: { maalgruppetype: findSelectedMaalgruppe(this.root?.data || {}) || 'ANNET' },
      prefilled: prefilledMaalgruppe,
    };
  }

  renderReact(element: any) {
    element.render(<></>);
  }
}

export default Maalgruppe;
