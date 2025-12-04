import Fieldset from 'formiojs/components/fieldset/Fieldset';
import baseComponentUtils from '../../base/baseComponentUtils';
import formGroupForm from './FormGroup.form';

class FormGroup extends Fieldset {
  static schema() {
    return Fieldset.schema({
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

  init() {
    super.init();
    baseComponentUtils.setupBuilderErrors(this);
  }

  static editForm() {
    return formGroupForm();
  }

  get defaultSchema() {
    return FormGroup.schema();
  }
}

export default FormGroup;
