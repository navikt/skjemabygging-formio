import FormioTextfield from 'formiojs/components/textfield/TextField';
import maalgruppeBuilder from './Maalgruppe.builder';
import maalgruppeForm from './Maalgruppe.form';

class Maalgruppe extends FormioTextfield {
  data: any;
  component: any;

  static schema() {
    return FormioTextfield.schema({
      label: 'Målgruppe',
      type: 'maalgruppe',
      key: 'maalgruppe',
      input: true,
      hideLabel: true,
      customConditional: 'show = false',
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
    if (!!this.data.aktivitet?.maalgruppe && this.data.aktivitet.maalgruppe !== '') {
      return this.data.aktivitet?.maalgruppe;
    } else if (!!this.component.defaultValue && this.component.defaultValue !== '') {
      return this.component.defaultValue;
    } else {
      // PR: Should this return empty string or ANNET?
      return 'ANNET';
    }
  }
}

export default Maalgruppe;
