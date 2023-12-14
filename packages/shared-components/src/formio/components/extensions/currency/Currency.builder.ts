const currencyBuilder = () => {
  return {
    title: 'Beløp',
    schema: {
      label: 'Beløp',
      type: 'currency',
      key: 'belop',
      fieldSize: 'input--s',
      input: true,
      currency: 'nok',
      spellcheck: false,
      dataGridLabel: true,
      clearOnHide: true,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default currencyBuilder;
