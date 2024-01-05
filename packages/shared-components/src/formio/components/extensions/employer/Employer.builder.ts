const employerBuilder = () => {
  return {
    title: 'Arbeidsgiver',
    group: 'organisasjon',
    schema: {
      label: 'Arbeidsgiver',
      type: 'textfield',
      key: 'arbeidsgiver',
      fieldSize: 'input--xxl',
      input: true,
      dataGridLabel: true,
      clearOnHide: true,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default employerBuilder;
