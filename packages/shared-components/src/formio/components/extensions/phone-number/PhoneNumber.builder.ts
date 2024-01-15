const phoneNumberBuilder = (keyPostfix = '') => {
  return {
    title: 'Telefon',
    schema: {
      label: 'Telefonnummer',
      type: 'phoneNumber',
      key: `telefonnummer${keyPostfix}`,
      fieldSize: 'input--s',
      input: true,
      dataGridLabel: true,
      inputMask: false,
      spellcheck: false,
      autocomplete: 'tel',
      clearOnHide: true,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default phoneNumberBuilder;
