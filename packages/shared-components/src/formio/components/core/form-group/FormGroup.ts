import Fieldset from 'formiojs/components/fieldset/Fieldset';
import resolveFormioDefault from '../../base/resolveFormioDefault';
import formGroupForm from './FormGroup.form';

const FieldsetBase = resolveFormioDefault(Fieldset);

class FormGroup extends FieldsetBase {
  static schema() {
    return FieldsetBase.schema({
      label: 'Skjemagruppe',
      key: 'navSkjemagruppe',
      type: 'navSkjemagruppe',
      legend: 'Skjemagruppe',
      components: [],
      input: false,
      persistent: false,
      backgroundColor: true,
    });
  }

  static editForm() {
    return formGroupForm();
  }

  get defaultSchema() {
    return FormGroup.schema();
  }
}

export default FormGroup;
