import { defaultBuilderSchema } from '../../base/builderHelper';

const emailBuilder = (keyPostfix = '') => {
  return {
    title: 'E-post',
    group: 'person',
    schema: {
      ...defaultBuilderSchema(),
      label: 'E-post',
      type: 'email',
      key: 'epost',
      fieldSize: 'input--xxl',
      input: true,
      dataGridLabel: true,
      autocomplete: 'email',
      clearOnHide: true,
      spellcheck: false,
    },
  };
};

export default emailBuilder;
