const employerBuilder = () => {
  return {
    title: 'Arbeidsgiver',
    schema: {
      label: 'Arbeidsgiver',
      type: 'textfield',
      key: 'arbeidsgiver',
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default employerBuilder;
