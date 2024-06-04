import Currency from './Currency';

const currencyBuilder = () => {
  const schema = Currency.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default currencyBuilder;
