const citizenshipBuilder = (keyPostfix = '') => {
  return {
    title: 'Statsborgerskap',
    group: 'person',
    schema: {
      label: 'Statsborgerskap',
      type: 'textfield',
      key: `statsborgerskap${keyPostfix}`,
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

export default citizenshipBuilder;
