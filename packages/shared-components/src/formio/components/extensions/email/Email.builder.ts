const emailBuilder = () => {
  return {
    title: 'E-post',
    schema: {
      label: 'E-post',
      type: 'email',
      key: 'epost',
      fieldSize: 'input--xxl',
      input: true,
      dataGridLabel: true,
      autocomplete: 'email',
      clearOnHide: true,
      spellcheck: false,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default emailBuilder;
