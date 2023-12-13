import { defaultBuilderSchema } from '../../base/builderHelper';

const firstNameBuilder = (keyPostfix = '') => {
  return {
    title: 'Fornavn',
    group: 'person',
    schema: {
      ...defaultBuilderSchema(),
      label: 'Fornavn',
      type: 'textfield',
      key: `fornavn${keyPostfix}`,
      fieldSize: 'input--xxl',
      input: true,
      dataGridLabel: true,
      clearOnHide: true,
      autocomplete: 'given-name',
    },
  };
};

export default firstNameBuilder;
