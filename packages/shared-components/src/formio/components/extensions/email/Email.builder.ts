const emailBuilder = () => {
  return {
    title: 'E-post',
    schema: {
      label: 'E-post',
      type: 'email',
      key: 'epost',
      autocomplete: 'email',
      spellcheck: false,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default emailBuilder;
