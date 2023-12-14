const selectBoxesBuilder = () => {
  return {
    title: 'Prosent',
    schema: {
      label: 'Prosent',
      type: 'number',
      key: 'prosent',
      input: true,
      dataGridLabel: true,
      spellcheck: false,
      clearOnHide: true,
      suffix: '%',
      fieldSize: 'input--xs',
      validateOn: 'blur',
      validate: {
        required: true,
        min: 0,
        max: 100,
      },
    },
  };
};

export default selectBoxesBuilder;
