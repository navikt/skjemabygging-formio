const citizenshipBuilder = (keyPostfix = '') => {
  return {
    title: 'Statsborgerskap',
    schema: {
      label: 'Statsborgerskap',
      type: 'textfield',
      key: `statsborgerskap${keyPostfix}`,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default citizenshipBuilder;
