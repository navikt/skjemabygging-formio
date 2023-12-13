import { defaultBuilderSchema } from '../../base/builderHelper';

const employerBuilder = () => {
  return {
    title: 'Arbeidsgiver',
    group: 'organisasjon',
    schema: {
      ...defaultBuilderSchema(),
      label: 'Arbeidsgiver',
      type: 'textfield',
      key: 'arbeidsgiver',
      fieldSize: 'input--xxl',
      input: true,
      dataGridLabel: true,
      clearOnHide: true,
    },
  };
};

export default employerBuilder;
