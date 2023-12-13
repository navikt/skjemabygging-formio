import { defaultBuilderSchema } from '../../base/builderHelper';

const citizenshipBuilder = (keyPostfix = '') => {
  return {
    title: 'Statsborgerskap',
    group: 'person',
    schema: {
      ...defaultBuilderSchema(),
      label: 'Statsborgerskap',
      type: 'textfield',
      key: `statsborgerskap${keyPostfix}`,
      fieldSize: 'input--xxl',
      input: true,
      dataGridLabel: true,
      clearOnHide: true,
    },
  };
};

export default citizenshipBuilder;
