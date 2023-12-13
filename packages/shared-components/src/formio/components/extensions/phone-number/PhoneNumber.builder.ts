import { defaultBuilderSchema } from '../../base/builderHelper';

const phoneNumberBuilder = (keyPostfix = '') => {
  return {
    title: 'Telefon',
    group: 'person',
    schema: {
      ...defaultBuilderSchema(),
      label: 'Telefonnummer',
      type: 'phoneNumber',
      key: `telefonnummer${keyPostfix}`,
      fieldSize: 'input--s',
      input: true,
      dataGridLabel: true,
      inputMask: false,
      spellcheck: false,
      autocomplete: 'tel',
      clearOnHide: true,
    },
  };
};

export default phoneNumberBuilder;
