import { defaultBuilderSchema } from '../../base/builderHelper';

const surnameBuilder = (keyPostfix = '') => {
  return {
    title: 'Etternavn',
    group: 'person',
    schema: {
      ...defaultBuilderSchema(),
      label: 'Etternavn',
      type: 'textfield',
      key: `etternavn${keyPostfix}`,
      fieldSize: 'input--xxl',
      input: true,
      dataGridLabel: true,
      clearOnHide: true,
      autocomplete: 'family-name',
    },
  };
};

export default surnameBuilder;
