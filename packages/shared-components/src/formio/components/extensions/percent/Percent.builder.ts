import { defaultBuilderSchema } from '../../base/builderHelper';

const selectBoxesBuilder = () => {
  return {
    title: 'Prosent',
    schema: {
      ...defaultBuilderSchema(),
      label: 'Prosent',
      type: 'number',
      key: 'prosent',
      input: true,
      dataGridLabel: true,
      spellcheck: false,
      clearOnHide: true,
      suffix: '%',
      fieldSize: 'input--xs',
      validate: {
        ...defaultBuilderSchema().validate,
        min: 0,
        max: 100,
      },
    },
  };
};

export default selectBoxesBuilder;
