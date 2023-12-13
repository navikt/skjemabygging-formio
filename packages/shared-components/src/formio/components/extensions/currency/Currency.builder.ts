import { defaultBuilderSchema } from '../../base/builderHelper';

const currencyBuilder = () => {
  return {
    title: 'Beløp',
    schema: {
      ...defaultBuilderSchema(),
      label: 'Beløp',
      type: 'currency',
      key: 'belop',
      fieldSize: 'input--s',
      input: true,
      currency: 'nok',
      spellcheck: false,
      dataGridLabel: true,
      clearOnHide: true,
    },
  };
};

export default currencyBuilder;
