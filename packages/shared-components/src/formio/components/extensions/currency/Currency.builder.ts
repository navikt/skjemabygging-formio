const currencyBuilder = () => {
  return {
    title: 'Beløp',
    schema: {
      label: 'Beløp',
      type: 'currency',
      key: 'belop',
      fieldSize: 'input--s',
      currency: 'nok',
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default currencyBuilder;
