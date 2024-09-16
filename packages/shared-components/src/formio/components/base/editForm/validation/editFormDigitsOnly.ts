const editFormDigitsOnly = () => {
  return {
    type: 'checkbox',
    label: 'Tillat kun siffer (0-9)',
    key: 'validate.digitsOnly',
  };
};

export default editFormDigitsOnly;
