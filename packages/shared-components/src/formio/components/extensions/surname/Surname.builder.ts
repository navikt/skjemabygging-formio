const surnameBuilder = (keyPostfix = '') => {
  return {
    title: 'Etternavn',
    schema: {
      label: 'Etternavn',
      type: 'textfield',
      key: `etternavn${keyPostfix}`,
      autocomplete: 'family-name',
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default surnameBuilder;
