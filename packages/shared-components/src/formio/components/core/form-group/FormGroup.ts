import Fieldset from 'formiojs/components/fieldset/Fieldset';
import FormBuilderOptions from '../../../form-builder-options';
import formGroupForm from './FormGroup.form';

class FormGroup extends Fieldset {
  static schema(...extend) {
    return Fieldset.schema(
      {
        ...FormBuilderOptions.builder.layout.components.navSkjemagruppe.schema,
      },
      ...extend,
    );
  }

  static editForm() {
    return formGroupForm();
  }

  get defaultSchema() {
    return FormGroup.schema();
  }
}

export default FormGroup;
