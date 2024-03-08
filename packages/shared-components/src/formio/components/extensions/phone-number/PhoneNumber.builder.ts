const phoneNumberBuilder = (keyPostfix = '') => {
  return {
    title: 'Telefon',
    schema: {
      label: 'Telefonnummer',
      type: 'phoneNumber',
      key: `telefonnummer${keyPostfix}`,
      fieldSize: 'input--s',
      spellcheck: false,
      autocomplete: 'tel',
      validateOn: 'blur',
      inputMask: false,
      validate: {
        required: true,
      },
    },
  };
};

export default phoneNumberBuilder;
