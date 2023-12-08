import FormioRadio from 'formiojs/components/radio/Radio';
import FormBuilderOptions from '../../../form-builder-options';
import radioForm from './Radio.form';

class Radio extends FormioRadio {
  static schema(...extend) {
    return FormioRadio.schema(
      {
        ...FormBuilderOptions.builder.basic.components.radiopanel.schema,
      },
      ...extend,
    );
  }

  static editForm() {
    return radioForm();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.basic.components.radiopanel;
  }

  get defaultSchema() {
    return Radio.schema();
  }
}

export default Radio;
