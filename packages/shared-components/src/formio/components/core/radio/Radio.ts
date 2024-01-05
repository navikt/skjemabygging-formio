import FormioRadio from 'formiojs/components/radio/Radio';
import radioBuilder from './Radio.builder';
import radioForm from './Radio.form';

class Radio extends FormioRadio {
  static schema() {
    return FormioRadio.schema({
      label: 'Radiopanel',
      type: 'radiopanel',
      key: 'radiopanel',
      input: true,
      hideLabel: false,
      clearOnHide: true,
      dataGridLabel: true,
      values: [
        {
          value: 'ja',
          label: 'Ja',
        },
        {
          value: 'nei',
          label: 'Nei',
        },
      ],
    });
  }

  static editForm() {
    return radioForm();
  }

  static get builderInfo() {
    return radioBuilder();
  }

  get defaultSchema() {
    return Radio.schema();
  }
}

export default Radio;
