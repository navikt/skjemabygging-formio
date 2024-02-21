const firstNameBuilder = (keyPostfix = '') => {
  return {
    title: 'Fornavn',
    schema: {
      label: 'Fornavn',
      type: 'textfield',
      key: `fornavn${keyPostfix}`,
      autocomplete: 'given-name',
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default firstNameBuilder;
